from django.contrib import admin
from django.urls import path, include
from users.views import get_csrf

urlpatterns = [
    path('api/auth/csrf/', get_csrf),
    path('api/auth/', include('users.urls')),
    path('api/events/', include('events.urls')),
    path('api/location/', include('location.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
]
