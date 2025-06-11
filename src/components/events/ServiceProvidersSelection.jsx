import { useState, useEffect } from 'react';
import eventService from '../../services/eventService';
import './ServiceProvidersSelection.css';

const ServiceProvidersSelection = ({ eventData, onProviderSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!eventData || !eventData.title || !eventData.category || !eventData.location) {
        setError('Event information is incomplete. Please complete Step 1 first.');
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
          event_name: eventData.title,
          event_category: eventData.category.name,
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
  }, [eventData]);

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

  if (providers.length === 0 && !loading) {
    return (
      <div className="no-providers">
        <p>No service providers found for this event type and location.</p>
        <p>You can continue without selecting providers or try a different location.</p>
      </div>
    );
  }

  return (
    <div className="service-providers-container">
      <h3>Select Service Providers for Your Event</h3>
      <p className="selection-hint">Select one or more service providers that you'd like to work with for your event.</p>
      
      {warning && (
        <div className="providers-warning">
          <p>{warning}</p>
        </div>
      )}
      
      <div className="providers-list">
        {providers.map((provider, index) => (
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
      
      <div className="selection-summary">
        <p>Selected Providers: {selectedProviders.length}</p>
      </div>
    </div>
  );
};

export default ServiceProvidersSelection; 