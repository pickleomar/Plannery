import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import LocationSearch from '../components/events/LocationSearch';
import DateTimePicker from '../components/common/DateTimePicker';
import ServiceProvidersSelection from '../components/events/ServiceProvidersSelection';
import './EditEventPage.css';

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: null,
    start_date: '',
    end_date: '',
    location: null,
    is_public: true
  });
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    const fetchEventAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesData = await eventService.getCategories();
        setCategories(categoriesData);
        
        // Fetch event details
        const eventDetails = await eventService.getEventDetails(eventId);
        
        // Format the event data
        const formattedEvent = {
          title: eventDetails.title,
          description: eventDetails.description || '',
          category: categoriesData.find(cat => cat.id === eventDetails.category),
          start_date: eventDetails.start_date,
          end_date: eventDetails.end_date || '',
          location: eventDetails.location,
          is_public: eventDetails.is_public
        };
        
        setEventData(formattedEvent);
        
        // Set selected providers if any
        if (eventDetails.service_providers && eventDetails.service_providers.length > 0) {
          setSelectedProviders(eventDetails.service_providers);
        }
        
      } catch (err) {
        console.error('Failed to fetch event data:', err);
        setError('Failed to load event data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventAndCategories();
  }, [eventId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    setEventData(prev => ({ ...prev, category: selectedCategory }));
  };
  
  const handleLocationSelect = (location) => {
    setEventData(prev => ({ ...prev, location }));
  };
  
  const handleDateChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleProviderSelect = (providers) => {
    setSelectedProviders(providers);
  };
  
  const handlePublicToggle = (e) => {
    setEventData(prev => ({ ...prev, is_public: e.target.checked }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Format data for API
      const formattedData = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category?.id,
        start_date: eventData.start_date,
        end_date: eventData.end_date || null,
        location: eventData.location,
        is_public: eventData.is_public,
        selected_providers: selectedProviders.map(provider => ({
          id: provider.id,
          name: provider.name
        }))
      };
      
      // Update the event
      await eventService.updateEvent(eventId, formattedData);
      
      // Show success message and navigate back to dashboard
      navigate('/dashboard', { 
        state: { 
          success: true, 
          message: 'Event updated successfully!' 
        } 
      });
      
    } catch (err) {
      console.error('Failed to update event:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update event. Please try again.'
      });
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  if (loading && !eventData.title) {
    return <div className="loading-container">Loading event data...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div className="edit-event-page">
      <div className="edit-event-container">
        <h2>Edit Event</h2>
        
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button className="close-notification" onClick={() => setNotification(null)}>×</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Event Category</label>
            <select
              id="category"
              name="category"
              value={eventData.category?.id || ''}
              onChange={handleCategoryChange}
              required
              className="form-control"
            >
              <option value="" disabled>Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Event Description</label>
            <textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
              className="form-control"
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Event Location</label>
            <LocationSearch 
              onLocationSelect={handleLocationSelect} 
              initialLocation={eventData.location}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Start Date & Time</label>
              <DateTimePicker 
                value={eventData.start_date} 
                onChange={(value) => handleDateChange('start_date', value)} 
                required
              />
            </div>
            
            <div className="form-group half">
              <label>End Date & Time (Optional)</label>
              <DateTimePicker 
                value={eventData.end_date} 
                onChange={(value) => handleDateChange('end_date', value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={eventData.is_public}
                onChange={handlePublicToggle}
              />
              Make this event public
            </label>
          </div>
          
          <div className="form-group service-providers-section">
            <h3>Service Providers</h3>
            <ServiceProvidersSelection 
              eventData={eventData}
              onProviderSelect={handleProviderSelect}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage; 