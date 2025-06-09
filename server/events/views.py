from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Event, Category
from .serializers import EventSerializer, CategorySerializer


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