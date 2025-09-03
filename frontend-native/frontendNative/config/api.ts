// API Configuration for different environments
export const API_CONFIG = {
  // Development - use your machine's IP address for mobile testing
  development: {
    baseURL: 'http://192.168.11.155:8000',
    authEndpoint: '/api/auth',
    eventsEndpoint: '/api/events',
    locationEndpoint: '/api/location',
  },
  
  // Production - update this when deploying
  production: {
    baseURL: 'https://your-production-domain.com',
    authEndpoint: '/api/auth',
    eventsEndpoint: '/api/events',
    locationEndpoint: '/api/location',
  }
};

// Get current environment
const getEnvironment = () => {
  // In development, you can change this to 'production' for testing
  return 'development';
};

// Export current config
export const getCurrentConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env as keyof typeof API_CONFIG];
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  const config = getCurrentConfig();
  return `${config.baseURL}${endpoint}`;
};
