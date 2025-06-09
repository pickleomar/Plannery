const API_URL = 'http://localhost:8000/api/auth';

// Store CSRF token in memory
let csrfTokenValue = null;

// Get CSRF token and return the actual token value
const getCsrfToken = async () => {
  try {
    // If we already have a token in memory, return it
    if (csrfTokenValue) {
      return csrfTokenValue;
    }
    
    const response = await fetch(`${API_URL}/csrf/`, {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CSRF request failed with status: ${response.status}`);
    }
    
    // Get token from response
    const data = await response.json();
    
    // Store the token in memory
    if (data.csrfToken) {
      csrfTokenValue = data.csrfToken;
      return csrfTokenValue;
    }
    
    // Fallback: try to get token from cookies
    const tokenFromCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
      
    if (tokenFromCookie) {
      csrfTokenValue = tokenFromCookie;
      return tokenFromCookie;
    }
    
    throw new Error('CSRF token not found');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

// Register a new user
const register = async (userData) => {
  try {
    // Get CSRF token first
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Registration failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store user data in localStorage (but not the token)
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
const login = async (credentials) => {
  try {
    // Get CSRF token first
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle common Django REST Framework error formats
      const errorMessage =
        errorData.detail ||                      // Standard DRF error
        errorData.non_field_errors?.[0] ||       // Serializer non-field errors
        errorData.error ||                       // Custom backend error
        `Login failed (status: ${response.status})`;
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Store user data in localStorage (but not the token)
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Propagate to AuthProvider
  }
};

// Logout user
const logout = async () => {
  try {
    // Get CSRF token first
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Clear CSRF token in memory
    csrfTokenValue = null;
    
    if (!response.ok) {
      console.warn(`Logout returned status: ${response.status}`);
      return { detail: 'Logged out locally' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove user data even if server-side logout fails
    localStorage.removeItem('user');
    return { detail: 'Logged out locally' };
  }
};

// Refresh the access token
const refreshToken = async () => {
  try {
    // Get CSRF token first
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Get current user profile
const getCurrentUser = async () => {
  try {
    // First try to refresh the token
    try {
      await refreshToken();
    } catch (error) {
      console.warn('Token refresh failed, proceeding with current token');
    }
    
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/profile/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.status}`);
    }
    
    const userData = await response.json();
    
    // Update user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// Check if user is logged in
const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getCsrfToken,
  refreshToken
};

export default authService; 