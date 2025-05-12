from django.shortcuts import render
import json
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_initial_location(request):
    """
    Get user's approximate location based on IP address using ipinfo.io.
    """
    try:
        # Call ipinfo.io API
        #token = settings.IPINFO_TOKEN
        url = f"https://ipinfo.io/json"
        
        response = requests.get(url)
        data = response.json()
        
        if 'loc' in data:
            # Parse the location string "lat,lng"
            lat, lng = data['loc'].split(',')
            location = {
                'lat': float(lat),
                'lng': float(lng),
                'city': data.get('city', ''),
                'region': data.get('region', ''),
                'country': data.get('country', '')
            }
            return Response(location)
        else:
            # Default to a reasonable location if geolocation fails
            return Response({
                'lat': 37.7749,  # Default to San Francisco
                'lng': -122.4194,
                'city': 'Unknown',
                'region': 'Unknown',
                'country': 'Unknown'
            })
            
    except Exception as e:
        return Response(
            {'error': f'Failed to get location: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_locations(request):
    """
    Search for locations using Google Maps Places API via RapidAPI.
    """
    try:
        query = request.GET.get('query', '')
        lat = request.GET.get('lat')
        lng = request.GET.get('lng')
        
        if not query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Call Google Maps Places API via RapidAPI
        url = "https://google-map-places.p.rapidapi.com/maps/api/place/queryautocomplete/json"
        
        headers = {
            "X-RapidAPI-Host": "google-map-places.p.rapidapi.com",
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY
        }
        
        params = {
            "input": query,
            "radius": "100",
            "language": "en",
            "offset": "3"
        }
        
        # Add location coordinates if available
        if lat and lng:
            params["location"] = f"{lat},{lng}"
        
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        
        # Process and simplify the response before sending to frontend
        places = []
        if 'predictions' in data:
            for place in data['predictions']:
                places.append({
                    'id': place.get('place_id', ''),
                    'description': place.get('description', ''),
                    'structured_formatting': place.get('structured_formatting', {})
                })
        
        return Response({'results': places})
        
    except Exception as e:
        return Response(
            {'error': f'Failed to search locations: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
