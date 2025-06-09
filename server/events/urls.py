from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('create/', views.EventCreateView.as_view(), name='event-create'),
    path('my-events/', views.UserEventsListView.as_view(), name='user-events'),
    path('all/', views.AllEventsListView.as_view(), name='all-events'),
] 