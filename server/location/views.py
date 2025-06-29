from django.shortcuts import render
import json
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import math

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_initial_location(request):
    """
    Get user's approximate location based on IP address using ipinfo.io.
    """
    try:

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
    try:
        query = request.GET.get('query', '')
        lat = request.GET.get('lat')
        lng = request.GET.get('lng')
        
        if not query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

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




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_location_providers(request):
    """
    Find and recommend service providers, equipment suppliers, and stores related to the event category.
    
    Request body should include:
    - event_name: Name of the event
    - event_category: Category of the event (used to determine relevant service provider types)
    - event_location: Location of the event (address or coordinates)
    """
    try:
        # Get request data
        data = request.data
        event_name = data.get('event_name', '')
        event_category = data.get('event_category', '')
        event_location = data.get('event_location', '')
        
        if not event_location:
            return Response(
                {'error': 'Event location is required'},
                status=status.HTTP_400_BAD_REQUEST
                          )
              
        # Map event categories to relevant service providers and suppliers from Google Places API Table A
        category_to_types = {
            'Music': ['performing_arts_theater', 'concert_hall', 'electronics_store', 'karaoke'],
            
            'Food & Drink': ['restaurant', 'cafe', 'catering_service', 'bakery', 'meal_delivery', 'meal_takeaway', 'supermarket', 'bar', 'fine_dining_restaurant', 'buffet_restaurant', 'liquor_store'],
            
            'Business': ['corporate_office', 'convention_center', 'event_venue', 'banquet_hall', 'insurance_agency', 'lawyer', 'consultant', 'accounting', 'catering_service'],
            
            'Sports': ['sports_complex', 'stadium', 'arena', 'athletic_field', 'fitness_center', 'gym', 'sports_club', 'sporting_goods_store', 'sports_activity_location'],
            
            'Education': ['school', 'university', 'library', 'book_store', 'museum', 'cultural_center'],
            
            'Arts': ['art_gallery', 'art_studio', 'museum', 'cultural_center', 'performing_arts_theater'],
            
            'Technology': ['electronics_store', 'cell_phone_store', 'internet_cafe'],
            
            'Health': ['pharmacy', 'drugstore', 'hospital', 'doctor', 'wellness_center', 'fitness_center'],
            
            'Travel': ['travel_agency', 'tourist_information_center', 'airport', 'hotel', 'lodging', 'tourist_attraction'],
            
            'Fashion': ['clothing_store', 'shoe_store', 'jewelry_store', 'beauty_salon', 'makeup_artist', 'hair_salon'],
            
            'Film & Media': ['movie_theater', 'movie_rental', 'electronics_store', 'video_arcade'],
            
            'Gaming': ['video_arcade', 'electronics_store', 'store'],
            
            'Community': ['community_center', 'cultural_center', 'event_venue', 'convention_center'],
            
            'Charity': ['community_center', 'event_venue', 'banquet_hall'],
            
            'Religious': ['church', 'synagogue', 'mosque', 'hindu_temple', 'florist', 'catering_service'],
            
            'Politics': ['government_office', 'city_hall', 'event_venue', 'banquet_hall', 'community_center'],
            
            'Science': ['museum', 'university', 'school', 'electronics_store', 'book_store'],
            
            'Family': ['amusement_center', 'park', 'playground', 'restaurant', 'zoo', 'movie_theater', 'aquarium'],
            
            'Pets': ['pet_store', 'veterinary_care', 'park', 'dog_park'],
            
            'Outdoors': ['park', 'hiking_area', 'sporting_goods_store', 'bicycle_store', 'camping_cabin', 'garden', 'national_park', 'state_park'],
            
            'Nightlife': ['bar', 'night_club', 'karaoke', 'restaurant', 'liquor_store', 'comedy_club'],
            
            'Performing Arts': ['performing_arts_theater', 'concert_hall', 'dance_hall', 'cultural_center', 'event_venue'],
            
            'Culture': ['museum', 'art_gallery', 'cultural_center', 'historical_landmark', 'performing_arts_theater', 'book_store'],
            
            'Holiday': ['event_venue', 'banquet_hall', 'gift_shop', 'florist', 'restaurant', 'hotel'],
            
            'default': ['store', 'event_venue', 'restaurant', 'catering_service']
        }

        
        # Get place types based on event category or use default
        included_types = category_to_types.get(event_category, category_to_types['default'])
        
        # Process location data
        try:
            geocode_result = geocode_address(event_location.get('description', ''))
            latitude = geocode_result['lat']
            longitude = geocode_result['lng']
            formatted_address = geocode_result['formatted_address']
            print(f"Geocode result: {geocode_result}")
            
            if not latitude or not longitude:
                return Response(
                    {'error': 'Failed to get valid coordinates from location data'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': f'Failed to process location data: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Now search for nearby places
        nearby_url = "https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchNearby"
        nearby_headers = {
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "*",
            "x-rapidapi-host": "google-map-places-new-v2.p.rapidapi.com",
            "x-rapidapi-key": settings.RAPIDAPI_KEY,
        }
        
        nearby_data = {
            "languageCode": "",
            "regionCode": "",
            "includedTypes": included_types,
            "excludedTypes": [],
            "includedPrimaryTypes": [],
            "excludedPrimaryTypes": [],
            "maxResultCount": 15,  # Get more results to select top 5 based on ranking
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": latitude,
                        "longitude": longitude
                    },
                    "radius": 15000  # 15km radius
                }
            },
            "rankPreference": 0
        }
        
        try:
            nearby_response = requests.post(nearby_url, headers=nearby_headers, json=nearby_data)
            
            # Check if the response was successful
            if nearby_response.status_code != 200:
                error_detail = ""
                try:
                    error_content = nearby_response.json()
                    if 'message' in error_content:
                        error_detail = f" Details: {error_content['message']}"
                    elif 'error' in error_content:
                        error_detail = f" Details: {error_content['error']}"
                except:
                    # If we can't parse the JSON, include the raw content
                    error_detail = f" Raw response: {nearby_response.text[:200]}"
        
            nearby_results = nearby_response.json()
            print(f"Nearby results: {nearby_results}")
            
        except requests.RequestException as e:
            return Response(
                {'error': f'RapidAPI service unavailable: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid response from RapidAPI service'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        if 'places' not in nearby_results or not nearby_results['places']:
            return Response(
                {'error': 'No suitable service providers found near the specified location'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Process and rank results
        providers = []
        for place in nearby_results['places']:
            # Debug: Check phone number fields
            print(f"Place: {place.get('displayName', {}).get('text', 'Unknown')}")
            print(f"  internationalPhoneNumber: {place.get('internationalPhoneNumber')}")
            print(f"  nationalPhoneNumber: {place.get('nationalPhoneNumber')}")
            print(f"  websiteUri: {place.get('websiteUri')}")
            
            # Skip places without ratings for better recommendations
            if 'rating' not in place:
                continue
                
            provider = {
                'name': place.get('displayName', {}).get('text', 'Unknown Provider'),
                'rating': place.get('rating', 0),
                'address': place.get('formattedAddress', 'Address not available'),
                'phone_number': place.get('internationalPhoneNumber') or place.get('nationalPhoneNumber') or 'No phone number available',
                'website': place.get('websiteUri', 'No website available'),
                'types': place.get('types', []),
                'user_rating_count': place.get('userRatingCount', 0),
                'coordinates': {
                    'lat': place.get('location', {}).get('latitude'),
                    'lng': place.get('location', {}).get('longitude')
                }

            }
            
            # Extract any reviews if available
            if 'reviews' in place and place['reviews']:
                review = place['reviews'][0]
                provider['description'] = review.get('text', {}).get('text', 'No description available')
            else:
                provider['description'] = 'No description available'
                
            # Calculate distance if coordinates are available
            if provider['coordinates']['lat'] and provider['coordinates']['lng']:
                # This is a simple calculation that doesn't account for road distances
                # For a more accurate distance, you would use the Distance Matrix API
                def haversine(lon1, lat1, lon2, lat2):
                    # Convert decimal degrees to radians 
                    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
                    # Haversine formula 
                    dlon = lon2 - lon1 
                    dlat = lat2 - lat1 
                    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                    c = 2 * math.asin(math.sqrt(a)) 
                    r = 6371  # Radius of Earth in kilometers
                    return c * r
                    
                provider['distance'] = round(haversine(
                    longitude, 
                    latitude,
                    provider['coordinates']['lng'],
                    provider['coordinates']['lat']
                ), 2)
            else:
                provider['distance'] = None
                
            # Extract tags/keywords from the place types
            provider['tags'] = [t.replace('_', ' ').title() for t in place.get('types', [])]
            
            providers.append(provider)
            
        # Rank providers by a combined score of rating, review count, and proximity
        for provider in providers:
            # Skip providers without ratings or coordinates
            if not provider.get('rating') or not provider.get('distance'):
                provider['rank_score'] = 0
                continue
                
            # Calculate weighted score
            rating_weight = 0.5
            review_count_weight = 0.3
            proximity_weight = 0.2
            
            # Normalize review count (0-100 scale)
            normalized_review_count = min(provider.get('user_rating_count', 0) / 100, 1.0)
            
            # Normalize distance (closer is better, max 15km)
            normalized_distance = 1.0 - min(provider.get('distance', 15) / 15, 1.0)
            
            # Calculate combined score
            provider['rank_score'] = (
                (provider.get('rating', 0) / 5) * rating_weight +
                normalized_review_count * review_count_weight +
                normalized_distance * proximity_weight
            )
            
        # Sort by rank score and take top 10
        providers.sort(key=lambda x: x.get('rank_score', 0), reverse=True)
        top_providers = providers[:10] #Change this to desired providers count 
        
        # Format response
        response_data = {
            'event_name': event_name,
            'event_category': event_category,
            'event_location': {
                'address': formatted_address,
                'coordinates': {'lat': latitude, 'lng': longitude}
            },
            'service_providers': top_providers
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to find service providers: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Helper function to geocode an address without creating a response
def geocode_address(address):
    """
    Internal helper function to geocode an address
    """
    url = f'https://google-map-places.p.rapidapi.com/maps/api/geocode/json'
    
    headers = {
        "X-RapidAPI-Host": "google-map-places.p.rapidapi.com",
        "X-RapidAPI-Key": settings.RAPIDAPI_KEY
    }
    
    params = {
        "address": address,
        "language": "en",
        "region": "en",
        "location_type": "APPROXIMATE"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        print(f"Geocoding response: {data}")
        if data.get('status') != 'OK' or not data.get('results'):
            print(f"Geocoding API error: {data.get('status')}, Address: {address}")
            
            # Default to New York City
            return {
                'lat': 40.7128, 
                'lng': -74.0060, 
                'formatted_address': 'New York, NY, USA (default)'
            }
            
        location = data['results'][0]['geometry']['location']
        return {
            'lat': location['lat'],
            'lng': location['lng'],
            'formatted_address': data['results'][0]['formatted_address']
        }
        
    except Exception as e:
        print(f"Geocoding exception: {str(e)}, Address: {address}")
        
        # Default fallback for any exceptions
        return {
            'lat': 40.7128, 
            'lng': -74.0060, 
            'formatted_address': 'New York, NY, USA (error fallback)'
        }

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_specific_providers(request):
    """
    Search for specific service providers using text query.
    
    Request body should include:
    - search_query: Text query to search for specific providers
    - event_location: Location of the event (address or coordinates)
    """
    try:
        # Get request data
        data = request.data
        search_query = data.get('search_query', '')
        event_location = data.get('event_location', '')
        
        if not search_query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not event_location:
            return Response(
                {'error': 'Event location is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process location data
        try:
            geocode_result = geocode_address(event_location.get('description', ''))
            latitude = geocode_result['lat']
            longitude = geocode_result['lng']
            formatted_address = geocode_result['formatted_address']
            print(f"Geocode result: {geocode_result}")
            
            if not latitude or not longitude:
                return Response(
                    {'error': 'Failed to get valid coordinates from location data'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': f'Failed to process location data: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Search for places using text query
        search_url = "https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchText"
        search_headers = {
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "*",
            "x-rapidapi-host": "google-map-places-new-v2.p.rapidapi.com",
            "x-rapidapi-key": settings.RAPIDAPI_KEY,
        }
        
        search_data = {
            "textQuery": search_query,
            "languageCode": "en",
            "regionCode": "",
            "rankPreference": 0,
            "maxResultCount": 15,
            "locationBias": {
                "circle": {
                    "center": {
                        "latitude": latitude,
                        "longitude": longitude
                    },
                    "radius": 15000  # 15km radius
                }
            }
        }
        
        try:
            search_response = requests.post(search_url, headers=search_headers, json=search_data)
            
            # Check if the response was successful
            if search_response.status_code != 200:
                error_detail = ""
                try:
                    error_content = search_response.json()
                    if 'message' in error_content:
                        error_detail = f" Details: {error_content['message']}"
                    elif 'error' in error_content:
                        error_detail = f" Details: {error_content['error']}"
                except:
                    error_detail = f" Raw response: {search_response.text[:200]}"
                    
                return Response(
                    {'error': f'Search API error (status {search_response.status_code}){error_detail}'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        
            search_results = search_response.json()
            print(f"Search results: {search_results}")
            
        except requests.RequestException as e:
            return Response(
                {'error': f'RapidAPI service unavailable: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid response from RapidAPI service'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        if 'places' not in search_results or not search_results['places']:
            return Response({
                'message': 'No providers found for your search query',
                'service_providers': []
            }, status=status.HTTP_200_OK)
            
        # Process and rank results (using same logic as get_location_providers)
        providers = []
        for place in search_results['places']:
            # Debug: Check phone number fields in search results
            print(f"Search Place: {place.get('displayName', {}).get('text', 'Unknown')}")
            print(f"  internationalPhoneNumber: {place.get('internationalPhoneNumber')}")
            print(f"  nationalPhoneNumber: {place.get('nationalPhoneNumber')}")
            print(f"  websiteUri: {place.get('websiteUri')}")
            
            # Skip places without ratings for better recommendations
            if 'rating' not in place:
                continue
                
            provider = {
                'name': place.get('displayName', {}).get('text', 'Unknown Provider'),
                'rating': place.get('rating', 0),
                'address': place.get('formattedAddress', 'Address not available'),
                'phone_number': place.get('internationalPhoneNumber') or place.get('nationalPhoneNumber') or 'No phone number available',
                'website': place.get('websiteUri', 'No website available'),
                'types': place.get('types', []),
                'user_rating_count': place.get('userRatingCount', 0),
                'coordinates': {
                    'lat': place.get('location', {}).get('latitude'),
                    'lng': place.get('location', {}).get('longitude')
                }
            }
            
            # Extract any reviews if available
            if 'reviews' in place and place['reviews']:
                review = place['reviews'][0]
                provider['description'] = review.get('text', {}).get('text', 'No description available')
            else:
                provider['description'] = 'No description available'
                
            # Calculate distance if coordinates are available
            if provider['coordinates']['lat'] and provider['coordinates']['lng']:
                def haversine(lon1, lat1, lon2, lat2):
                    # Convert decimal degrees to radians 
                    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
                    # Haversine formula 
                    dlon = lon2 - lon1 
                    dlat = lat2 - lat1 
                    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                    c = 2 * math.asin(math.sqrt(a)) 
                    r = 6371  # Radius of Earth in kilometers
                    return c * r
                    
                provider['distance'] = round(haversine(
                    longitude, 
                    latitude,
                    provider['coordinates']['lng'],
                    provider['coordinates']['lat']
                ), 2)
            else:
                provider['distance'] = None
                
            # Extract tags/keywords from the place types
            provider['tags'] = [t.replace('_', ' ').title() for t in place.get('types', [])]
            
            providers.append(provider)
            
        # Rank providers by a combined score of rating, review count, and proximity
        for provider in providers:
            # Skip providers without ratings or coordinates
            if not provider.get('rating') or not provider.get('distance'):
                provider['rank_score'] = 0
                continue
                
            # Calculate weighted score
            rating_weight = 0.5
            review_count_weight = 0.3
            proximity_weight = 0.2
            
            # Normalize review count (0-100 scale)
            normalized_review_count = min(provider.get('user_rating_count', 0) / 100, 1.0)
            
            # Normalize distance (closer is better, max 15km)
            normalized_distance = 1.0 - min(provider.get('distance', 15) / 15, 1.0)
            
            # Calculate combined score
            provider['rank_score'] = (
                (provider.get('rating', 0) / 5) * rating_weight +
                normalized_review_count * review_count_weight +
                normalized_distance * proximity_weight
            )
            
        # Sort by rank score and take top 10
        providers.sort(key=lambda x: x.get('rank_score', 0), reverse=True)
        top_providers = providers[:10]
        
        # Format response
        response_data = {
            'search_query': search_query,
            'event_location': {
                'address': formatted_address,
                'coordinates': {'lat': latitude, 'lng': longitude}
            },
            'service_providers': top_providers
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to search providers: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
