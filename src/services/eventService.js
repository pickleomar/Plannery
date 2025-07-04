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
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
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
        'X-Csrftoken': csrfToken, 
      },
      credentials: 'include', 
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

// Get users events
const getUserEvents = async () => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/my-events/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
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
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
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
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
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
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
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

// Get service providers for an event
const getServiceProviders = async (eventData) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/location/providers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to get service providers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting service providers:', error);
    throw error;
  }
};

// Search for specific service providers by text query
const searchSpecificProviders = async (searchQuery, eventLocation) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const requestData = {
      search_query: searchQuery,
      event_location: eventLocation
    };
    
    const response = await fetch(`${API_URL}/location/search-providers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to search providers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching specific providers:', error);
    throw error;
  }
};

// Create a provider from API data and link it to an event
const createProviderFromApi = async (data) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/providers/create-from-api/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create provider: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating provider:', error);
    throw error;
  }
};

// Clear all providers from an event
const clearEventProviders = async (eventId) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/${eventId}/providers/clear/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to clear providers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing providers:', error);
    throw error;
  }
};

// Delete an event
const deleteEvent = async (eventId) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/${eventId}/delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete event: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event details including service providers
const getEventDetails = async (eventId) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    const response = await fetch(`${API_URL}/events/${eventId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

// Update an existing event
const updateEvent = async (eventId, eventData) => {
  try {
    // Get CSRF token
    const csrfToken = await getCsrfToken();
    
    // Debug: Log the data being sent
    console.log('Updating event with ID:', eventId);
    console.log('Event data being sent:', JSON.stringify(eventData, null, 2));
    
    const response = await fetch(`${API_URL}/events/${eventId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Csrftoken': csrfToken,
      },
      credentials: 'include', 
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update failed with status:', response.status);
      console.error('Error response:', errorData);
      throw new Error(errorData.detail || `Failed to update event: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

const eventService = {
  getCategories,
  createEvent,
  getUserEvents,
  getInitialLocation,
  searchLocations,
  getAllEvents,
  getServiceProviders,
  searchSpecificProviders,
  createProviderFromApi,
  clearEventProviders,
  deleteEvent,
  getEventDetails,
  updateEvent
};

export default eventService; 