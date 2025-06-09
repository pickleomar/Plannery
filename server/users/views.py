from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib.auth import get_user_model, login, logout
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()

# Helper function to set cookie tokens
def set_jwt_cookies(response, access_token, refresh_token):
    # Set access token in cookie
    response.set_cookie(
        settings.SIMPLE_JWT['AUTH_COOKIE'],
        access_token,
        max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
    )
    
    # Set refresh token in cookie
    response.set_cookie(
        settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
        refresh_token,
        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
    )
    
    return response

@ensure_csrf_cookie
def get_csrf(request):
    """
    This view sets a CSRF cookie and returns the token.
    The 'ensure_csrf_cookie' decorator ensures the cookie is set.
    """
    # Force Django to set the CSRF cookie
    csrf_token = get_token(request)
    
    response = JsonResponse({
        "detail": "CSRF cookie set",
        "csrfToken": csrf_token
    })
    
    # Set CORS headers
    response["Access-Control-Allow-Origin"] = request.META.get('HTTP_ORIGIN', '*')
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "X-CSRFToken, Content-Type"
    
    return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Prepare response with user data
        response_data = {
            "user": UserSerializer(user).data,
            "detail": "User registered successfully"
        }
        
        # Create response object
        response = Response(response_data, status=status.HTTP_201_CREATED)
        
        # Set JWT cookies
        return set_jwt_cookies(response, access_token, refresh_token)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        
        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Prepare response with user data
        response_data = {
            "user": UserSerializer(user).data,
            "detail": "Login successful"
        }
        
        # Create response object
        response = Response(response_data)
        
        # Set JWT cookies
        return set_jwt_cookies(response, access_token, refresh_token)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    if request.method == 'POST':
        try:
            # Create blank response
            response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
            
            # Delete JWT cookies
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            
            # Perform Django logout
            logout(request)
            
            return response
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token_view(request):
    """
    API view to refresh an expired access token
    """
    try:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        
        if not refresh_token:
            return Response({"detail": "Refresh token not found in cookies"}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Create a RefreshToken instance
        token = RefreshToken(refresh_token)
        
        # Generate new access token
        access_token = str(token.access_token)
        
        # Create response
        response = Response({"detail": "Token refreshed successfully"})
        
        # Update only the access token cookie
        response.set_cookie(
            settings.SIMPLE_JWT['AUTH_COOKIE'],
            access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
        )
        
        return response
        
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)