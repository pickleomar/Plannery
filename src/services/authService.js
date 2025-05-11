const API_URL = 'http://localhost:8000/api/auth';

// Get CSRF token
const getCsrfToken = async () => {
  try {
    const response = await fetch(`${API_URL}/csrf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CSRF request failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

// Register a new user
const register = async (userData) => {
  try {
    // Get CSRF token first
    await getCsrfToken();
    
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Registration failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
const login = async (credentials) => {
  try {
    // Get CSRF token first
    await getCsrfToken();
    
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout user
const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    // Clear user data from localStorage regardless of response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (!response.ok) {
      console.warn(`Logout returned status: ${response.status}`);
      return { detail: 'Logged out locally' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove the token even if server-side logout fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { detail: 'Logged out locally' };
  }
};

// Get current user profile
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_URL}/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// Check if user is logged in
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getCsrfToken
};

export default authService; 