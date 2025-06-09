import authService from './authService';

const API_URL = 'http://localhost:8000/api';

// Helper function to get CSRF token
const getCsrfToken = async () => {
  return await authService.getCsrfToken();
};

// Get all event categories
const getCategories = async () => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/categories/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create a new event
const createEvent = async (eventData) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to create event: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get user's events
const getUserEvents = async () => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/my-events/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
};

// Get initial location based on IP
const getInitialLocation = async () => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/location/get-initial-location/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to get location: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

// Search for locations
const searchLocations = async (query, lat, lng) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    // Build the URL with query parameters
    const url = new URL(`${API_URL}/location/search-locations/`);
    url.searchParams.append('query', query);
    if (lat) url.searchParams.append('lat', lat);
    if (lng) url.searchParams.append('lng', lng);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to search locations: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Get all events
const getAllEvents = async () => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/all/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all events: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};

const eventService = {
  getCategories,
  createEvent,
  getUserEvents,
  getInitialLocation,
  searchLocations,
  getAllEvents
};

export default eventService; 