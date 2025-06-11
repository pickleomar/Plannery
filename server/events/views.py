from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Event, Category, Provider, EventProvider
from .serializers import EventSerializer, CategorySerializer, ProviderSerializer, EventProviderSerializer


class CategoryListView(generics.ListAPIView):
    """
    API view to list all available event categories.
    """
    queryset = Category.objects.filter(is_approved=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class EventCreateView(generics.CreateAPIView):
    """
    API view to create a new event.
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Set the current user as the organizer
        serializer.save(organizer=self.request.user)


class UserEventsListView(generics.ListAPIView):
    """
    API view to list user's events.
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filter events by the current user
        return Event.objects.filter(organizer=self.request.user).order_by('-start_date')


class AllEventsListView(generics.ListAPIView):
    """
    API view to list all events.
    """
    queryset = Event.objects.all().order_by('-start_date')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, and delete a specific event.
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'event_id'
    
    def get_queryset(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # For modification operations, only allow access to user's own events
            return Event.objects.filter(organizer=self.request.user)
        # For read operations, allow access to all events
        return Event.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Get service providers for this event
        event_providers = EventProvider.objects.filter(event=instance)
        providers_data = []
        
        for event_provider in event_providers:
            provider = event_provider.provider
            provider_data = {
                'id': provider.id,
                'name': provider.name,
                'address': provider.address,
                'rating': provider.rating,
                'user_rating_count': provider.review_count,
                'description': provider.description,
                'tags': provider.tags,
                'status': event_provider.status
            }
            providers_data.append(provider_data)
            
        # Add providers to the response
        response_data = serializer.data
        response_data['service_providers'] = providers_data
        
        return Response(response_data)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({'message': 'Event deleted successfully'}, status=status.HTTP_200_OK)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to delete event: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventProvidersView(generics.ListCreateAPIView):
    """
    API view to list and add providers to an event.
    """
    serializer_class = EventProviderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return EventProvider.objects.filter(event_id=event_id)
    
    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_id')
        event = Event.objects.get(pk=event_id)
        
        # Only the event organizer can add providers
        if event.organizer != self.request.user:
            self.permission_denied(self.request)
            
        serializer.save(selected_by=self.request.user)
        
    def create(self, request, *args, **kwargs):
        event_id = self.kwargs.get('event_id')
        
        # Check if we're getting a list of providers or a single one
        if isinstance(request.data, list):
            results = []
            for provider_data in request.data:
                provider_data['event'] = event_id
                serializer = self.get_serializer(data=provider_data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                results.append(serializer.data)
            return Response(results, status=status.HTTP_201_CREATED)
        else:
            # Add event_id to the request data
            request.data['event'] = event_id
            return super().create(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_provider_from_api(request):
    """
    Create a provider from API data and link it to an event.
    """
    event_id = request.data.get('event_id')
    provider_data = request.data.get('provider_data')
    
    if not event_id or not provider_data:
        return Response(
            {'error': 'Both event_id and provider_data are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        event = Event.objects.get(pk=event_id)
        
        # Only the event organizer can add providers
        if event.organizer != request.user:
            return Response(
                {'error': 'You are not authorized to add providers to this event'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Extract provider data
        provider = Provider.objects.create(
            name=provider_data.get('name', 'Unknown Provider'),
            api_source='RAPIDAPI',
            external_id=provider_data.get('place_id', ''),
            address=provider_data.get('address', ''),
            rating=provider_data.get('rating', 0.0),
            review_count=provider_data.get('user_rating_count', 0),
            coordinates=provider_data.get('coordinates', {}),
            description=provider_data.get('description', ''),
            tags=provider_data.get('tags', []),
            provider_type=provider_data.get('provider_type', '')
        )
        
        # Link to event
        event_provider = EventProvider.objects.create(
            event=event,
            provider=provider,
            selected_by=request.user,
            status='pending'
        )
        
        serializer = EventProviderSerializer(event_provider)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to create provider: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )