
## 1. Register Endpoint

```bash
curl -X POST http://localhost:8080/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "role": "ORGANIZER",
    "password": "securepassword123",
    "password_confirm": "securepassword123"
  }'
```

**Code Location:**
- **URL Definition:** `server/users/urls.py`, line 5: `path('register/', views.RegisterView.as_view(), name='register')`
- **View Logic:** `server/users/views.py`, lines 19-33 in `RegisterView` class
- **Serializer Logic:** `server/users/serializers.py`, lines 13-37 in `RegisterSerializer`

The registration flow works as follows:
1. Request hits the URL pattern in `urls.py`
2. Django routes to `RegisterView.post()` method
3. The view uses `RegisterSerializer` to validate data
4. If valid, `RegisterSerializer.create()` creates a new user and sets the password
5. The view generates a token and returns user data and token in the response

## 2. Login Endpoint

```bash
curl -X POST http://localhost:8080/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

**Code Location:**
- **URL Definition:** `server/users/urls.py`, line 6: `path('login/', views.LoginView.as_view(), name='login')`
- **View Logic:** `server/users/views.py`, lines 35-49 in `LoginView` class
- **Serializer Logic:** `server/users/serializers.py`, lines 39-57 in `LoginSerializer`

The login flow works as follows:
1. Request hits the URL pattern in `urls.py`
2. Django routes to `LoginView.post()` method
3. `LoginSerializer` validates credentials using Django's `authenticate()`
4. The authenticate function uses `EmailBackend` (defined in `users/backends.py`)
5. If valid, the view logs the user in, creates/gets a token, and returns user data with token

## 3. Logout Endpoint (requires authentication)

```bash
curl -X POST http://localhost:8080/api/auth/logout/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

**Code Location:**
- **URL Definition:** `server/users/urls.py`, line 7: `path('logout/', views.logout_view, name='logout')`
- **View Logic:** `server/users/views.py`, lines 51-59 in `logout_view` function

The logout flow works as follows:
1. Request with token hits the URL pattern
2. Django's authentication middleware validates the token
3. `logout_view` function deletes the user's token and logs them out
4. Returns a success message

## 4. User Profile Endpoint (requires authentication)

```bash
curl -X GET http://localhost:8080/api/auth/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

**Code Location:**
- **URL Definition:** `server/users/urls.py`, line 8: `path('profile/', views.user_profile, name='profile')`
- **View Logic:** `server/users/views.py`, lines 61-65 in `user_profile` function
- **Serializer Logic:** `server/users/serializers.py`, lines 6-11 in `UserSerializer`

The profile flow works as follows:
1. Request with token hits the URL pattern
2. Django's authentication middleware validates the token and identifies the user
3. `user_profile` function gets the current user from `request.user`
4. Returns the serialized user data using `UserSerializer`

## 5. CSRF Token Endpoint

```bash
curl -X GET http://localhost:8080/api/auth/csrf/ -c cookies.txt
```

**Code Location:**
- **URL Definition:** `server/users/urls.py`, line 9 and `server/backend/urls.py` line 22
- **View Logic:** `server/users/views.py`, lines 16-17 in `get_csrf` function

This endpoint sets a CSRF cookie for browser clients to use with non-GET requests when working with session authentication.

---

**Important Note:** Replace `YOUR_TOKEN_HERE` with the actual token you receive from the login or register response. The token is needed for authenticated endpoints (logout and profile).

