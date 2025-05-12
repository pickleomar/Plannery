from django.urls import path
from . import views

urlpatterns = [
    path('get-initial-location/', views.get_initial_location, name='get_initial_location'),
    path('search-locations/', views.search_locations, name='search_locations'),
] 