import { useState, useEffect, useRef } from 'react';
import eventService from '../../services/eventService';
import './LocationSearch.css';

const LocationSearch = ({ onLocationSelect, initialLocation = null }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  // Get initial location on component mount
  useEffect(() => {
    if (!initialLocation) {
      fetchInitialLocation();
    }
    
    // Click outside handler to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [initialLocation]);

  const fetchInitialLocation = async () => {
    try {
      setLoading(true);
      const location = await eventService.getInitialLocation();
      setCurrentLocation(location);
    } catch (err) {
      setError('Failed to get your location. Please enter it manually.');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Debounce the search request
    searchTimeout.current = setTimeout(() => {
      searchLocations(query);
    }, 300);
  };

  const searchLocations = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      // Only include lat/lng if we have current location
      const lat = currentLocation?.lat;
      const lng = currentLocation?.lng;
      
      const { results: locationResults } = await eventService.searchLocations(query, lat, lng);
      setResults(locationResults);
      setShowDropdown(locationResults.length > 0);
    } catch (err) {
      setError('Error searching for locations');
      console.error('Search error:', err);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    setSearch(location.description);
    setShowDropdown(false);
    
    // Get approximate coordinates if available from the location data
    // Google Places API provides these in the 'geometry' field but our RapidAPI wrapper might not
    // For now, we'll send just the description which will be geocoded on the backend
    const formattedLocation = {
      placeId: location.id,
      description: location.description,
      mainText: location.structured_formatting?.main_text || '',
      secondaryText: location.structured_formatting?.secondary_text || '',
      // Add coordinates if we have current location
      latitude: currentLocation?.lat || null,
      longitude: currentLocation?.lng || null
    };
    
    onLocationSelect(formattedLocation);
  };

  return (
    <div className="location-search-container">
      <div className="location-input-container">
        <div className="input-icon">📍</div>
        <input
          type="text"
          className={`location-input ${error ? 'error' : ''}`}
          placeholder="Search for a location"
          value={search}
          onChange={handleSearchChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {loading && <div className="loading-indicator">🔄</div>}
      </div>
      
      {error && <div className="location-error">{error}</div>}
      
      {showDropdown && (
        <div className="location-results" ref={dropdownRef}>
          {results.map((result) => (
            <div 
              key={result.id} 
              className="location-result-item"
              onClick={() => handleSelectLocation(result)}
            >
              <div className="location-result-icon">📍</div>
              <div className="location-result-content">
                <div className="location-main-text">
                  {result.structured_formatting?.main_text || result.description}
                </div>
                {result.structured_formatting?.secondary_text && (
                  <div className="location-secondary-text">
                    {result.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch; 