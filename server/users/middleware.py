from django.utils.functional import SimpleLazyObject
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

class JWTCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.jwt_user = SimpleLazyObject(lambda: self.get_jwt_user(request))
        return self.get_response(request)

    def get_jwt_user(self, request):
        # Check for the access token in cookies
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if access_token:
            # Set the authorization header with the token from the cookie
            auth_header = f"{settings.SIMPLE_JWT['AUTH_HEADER_TYPES'][0]} {access_token}"
            request.META['HTTP_AUTHORIZATION'] = auth_header
            
            # Use JWT authentication to authenticate the user
            user, _ = JWTAuthentication().authenticate(request)
            return user
        return None 