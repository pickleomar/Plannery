import { useState, useEffect, useMemo } from 'react';
import eventService from '../../services/eventService';
import './ServiceProvidersSelection.css';

const ServiceProvidersSelection = ({ eventData, onProviderSelect, initialSelectedProviders = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState(initialSelectedProviders);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize selected providers from props
  useEffect(() => {
    if (initialSelectedProviders.length > 0 && !hasInitialized) {
      setSelectedProviders(initialSelectedProviders);
      setHasInitialized(true);
    }
  }, [initialSelectedProviders, hasInitialized]);

  // Memoize the essential event data to prevent unnecessary re-fetching
  const essentialEventData = useMemo(() => {
    if (!eventData) return null;
    return {
      title: eventData.title,
      categoryId: eventData.category?.id,
      categoryName: eventData.category?.name,
      locationDescription: eventData.location?.description,
      locationPlaceId: eventData.location?.placeId
    };
  }, [eventData?.title, eventData?.category?.id, eventData?.category?.name, eventData?.location?.description, eventData?.location?.placeId]);

  useEffect(() => {
    const fetchProviders = async () => {
      // Only fetch if we have the essential data and haven't fetched yet
      if (!essentialEventData || !essentialEventData.title || !essentialEventData.categoryId || !eventData.location) {
        setError('Event information is incomplete. Please complete Step 1 first.');
        return;
      }

      // Only fetch if we don't have providers yet
      if (providers.length > 0) {
        return;
      }

      try {
        setLoading(true);
        
        // Format the location data based on what the backend expects
        let formattedLocation;
        if (eventData.location.placeId) {
          // Format from LocationSearch component format to what backend expects
          formattedLocation = {
            description: eventData.location.description,
            lat: eventData.location.latitude || null,
            lng: eventData.location.longitude || null,
            place_id: eventData.location.placeId
          };
          
          // If we don't have coordinates but we have a description, use the description as a string
          if (!formattedLocation.lat && !formattedLocation.lng && eventData.location.description) {
            formattedLocation = eventData.location.description;
          }
        } else {
          // If it's already in the expected format, use as is
          formattedLocation = eventData.location;
        }
        
        // Use the service to get providers based on event details
        const response = await eventService.getServiceProviders({
          event_name: essentialEventData.title,
          event_category: essentialEventData.categoryName,
          event_location: formattedLocation
        });
        
        // Check if we got mock data
        if (response.note && response.note.includes('sample data')) {
          setProviders(response.service_providers || []);
          // Show a warning to the user that we're using sample data
          setWarning(`Note: ${response.note}. The displayed providers are examples only.`);
        } else {
          setProviders(response.service_providers || []);
        }
        
      } catch (err) {
        console.error('Error fetching service providers:', err);
        if (err.message && err.message.includes('RAPIDAPI')) {
          setError('API service is currently unavailable. Please try again later or contact support.');
        } else {
          setError('Failed to load service providers. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [essentialEventData, providers.length]); // Only depend on essential event data and whether we already have providers

  // Handle search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setShowingSearchResults(false);
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      
      // Format the location data for search
      let formattedLocation;
      if (eventData.location.placeId) {
        formattedLocation = {
          description: eventData.location.description,
          lat: eventData.location.latitude || null,
          lng: eventData.location.longitude || null,
          place_id: eventData.location.placeId
        };
        
        if (!formattedLocation.lat && !formattedLocation.lng && eventData.location.description) {
          formattedLocation = eventData.location.description;
        }
      } else {
        formattedLocation = eventData.location;
      }
      
      const response = await eventService.searchSpecificProviders(query, formattedLocation);
      setSearchResults(response.service_providers || []);
      setShowingSearchResults(true);
      
      if (!response.service_providers || response.service_providers.length === 0) {
        setSearchError('No providers found for your search query. Try a different search term.');
      }
      
    } catch (err) {
      console.error('Error searching providers:', err);
      setSearchError('Failed to search providers. Please try again.');
      setSearchResults([]);
      setShowingSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowingSearchResults(false);
    setSearchResults([]);
    setSearchError(null);
  };

  const handleProviderToggle = (provider) => {
    const isSelected = selectedProviders.some(p => p.name === provider.name);
    
    if (isSelected) {
      setSelectedProviders(selectedProviders.filter(p => p.name !== provider.name));
    } else {
      setSelectedProviders([...selectedProviders, provider]);
    }
  };

  useEffect(() => {
    // Notify parent component of selected providers
    onProviderSelect(selectedProviders);
  }, [selectedProviders, onProviderSelect]);

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="provider-rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full">★</span>
        ))}
        {halfStar && <span key="half" className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">☆</span>
        ))}
        <span className="rating-text">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return <div className="providers-loading">Loading service providers...</div>;
  }

  if (error) {
    return <div className="providers-error">{error}</div>;
  }

  // Determine which providers to display
  const currentProviders = showingSearchResults ? searchResults : providers;
  const isShowingResults = showingSearchResults || providers.length > 0;

  return (
    <div className="service-providers-container">
      <h3>Select Service Providers for Your Event</h3>
      <p className="selection-hint">Search for specific providers or select from our suggestions below.</p>
      
      {/* Search Bar */}
      <div className="provider-search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="provider-search-input"
            placeholder="Search for specific providers (e.g., 'McDonald's', 'Hilton Hotel', 'Best Buy')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        {isSearching && (
          <div className="search-loading">Searching...</div>
        )}
        
        {searchError && (
          <div className="search-error">{searchError}</div>
        )}
        
        {showingSearchResults && (
          <div className="search-status">
            <span>Showing search results for "{searchQuery}"</span>
            <button type="button" className="show-suggestions-btn" onClick={clearSearch}>
              Show suggested providers
            </button>
          </div>
        )}
      </div>
      
      {warning && (
        <div className="providers-warning">
          <p>{warning}</p>
        </div>
      )}
      
      {!isShowingResults && !loading && (
        <div className="no-providers">
          <p>No service providers found for this event type and location.</p>
          <p>You can continue without selecting providers or try a different location.</p>
        </div>
      )}
      
      {isShowingResults && (
        <div className="providers-list">
          {currentProviders.map((provider, index) => (
            <div 
              key={index} 
              className={`provider-card ${selectedProviders.some(p => p.name === provider.name) ? 'selected' : ''}`}
              onClick={() => handleProviderToggle(provider)}
            >
              <div className="provider-header">
                <h4>{provider.name}</h4>
                <div className="provider-select-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedProviders.some(p => p.name === provider.name)}
                    onChange={() => {}} // Handled by the card click
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="provider-details">
                <div className="provider-rating">
                  {getRatingStars(provider.rating)}
                  <span className="review-count">({provider.user_rating_count} reviews)</span>
                </div>
                
                <div className="provider-address">
                  <strong>Address:</strong> {provider.address}
                </div>
                
                <div className="provider-distance">
                  <strong>Distance:</strong> {provider.distance ? `${provider.distance} km` : 'Unknown'}
                </div>
                
                {provider.phone_number && provider.phone_number !== 'No phone number available' && (
                  <div className="provider-phone">
                    <strong>Phone:</strong> {provider.phone_number}
                  </div>
                )}
                
                {provider.website && provider.website !== 'No website available' && (
                  <div className="provider-website">
                    <strong>Website:</strong> 
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="provider-website-link">
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="provider-tags">
                  {provider.tags && provider.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="provider-description">
                  <p>{provider.description || 'No description available'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="selection-summary">
        <p>Selected Providers: {selectedProviders.length}</p>
      </div>
    </div>
  );
};

export default ServiceProvidersSelection; 