from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('create/', views.EventCreateView.as_view(), name='event-create'),
    path('my-events/', views.UserEventsListView.as_view(), name='user-events'),
    path('all/', views.AllEventsListView.as_view(), name='all-events'),
    path('<int:event_id>/', views.EventDetailView.as_view(), name='event-detail'),
    path('<int:event_id>/delete/', views.EventDetailView.as_view(), name='event-delete'),
    path('<int:event_id>/providers/', views.EventProvidersView.as_view(), name='event-providers'),
    path('providers/create-from-api/', views.create_provider_from_api, name='create-provider-from-api'),
] 