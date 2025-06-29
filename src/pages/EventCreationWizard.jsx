import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LocationSearch from '../components/events/LocationSearch';
import ServiceProvidersSelection from '../components/events/ServiceProvidersSelection';
import eventService from '../services/eventService';
import './EventCreationWizard.css';

const EventCreationWizard = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [createdEventId, setCreatedEventId] = useState(null);

  // Form data for all steps
  const [formData, setFormData] = useState({
    title: '',
    category: categoryId,
    start_date: new Date(),
    location: null,
    expected_attendance: 0,
    budget: 0,
    selectedProviders: []
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // For simplicity, we'll use the categories endpoint and find the one we need
        const categories = await eventService.getCategories();
        const foundCategory = categories.find(cat => cat.id.toString() === categoryId);
        
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        console.error('Failed to fetch category:', err);
        setError('Failed to load category information');
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      start_date: date
    });
    
    // Clear validation error for this field
    if (validationErrors.start_date) {
      setValidationErrors({
        ...validationErrors,
        start_date: null
      });
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      location
    });
    
    // Clear validation error for this field
    if (validationErrors.location) {
      setValidationErrors({
        ...validationErrors,
        location: null
      });
    }
  };

  const handleProviderSelect = useCallback((providers) => {
    setFormData(prevData => ({
      ...prevData,
      selectedProviders: providers
    }));
  }, []);

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Event date is required';
    } else {
      const currentDate = new Date();
      if (formData.start_date < currentDate) {
        errors.start_date = 'Event date cannot be in the past';
      }
    }
    
    if (!formData.location) {
      errors.location = 'Event location is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValidStep1 = validateStep1();
      if (!isValidStep1) return;
      
      // Create the event in the backend before proceeding to step 2
      try {
        setLoading(true);
        
        // Format the data for the API
        const eventData = {
          title: formData.title,
          category: parseInt(formData.category),
          start_date: formData.start_date.toISOString(),
          location: {
            place_id: formData.location.placeId,
            description: formData.location.description,
            main_text: formData.location.mainText,
            secondary_text: formData.location.secondaryText
          },
          expected_attendance: parseInt(formData.expected_attendance),
          budget: parseInt(formData.budget)
        };
        
        // Call the API to create the event
        const response = await eventService.createEvent(eventData);
        setCreatedEventId(response.id);
        
        // Move to step 2
        setCurrentStep(2);
        
      } catch (err) {
        console.error('Failed to create event:', err);
        setError('Failed to create the event. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      // Save selected providers
      if (formData.selectedProviders.length > 0) {
        try {
          setLoading(true);
          
          // Clean and format provider data to fit database constraints
          const cleanedProviders = formData.selectedProviders.map(provider => {
            // Clean phone number - remove all non-numeric characters and limit to 20 chars
            let cleanPhone = '';
            if (provider.phone_number && provider.phone_number !== 'No phone number available') {
              cleanPhone = provider.phone_number.replace(/[^\d+\-\s()]/g, '').substring(0, 20);
            }
            
            // Clean website URL - limit to 200 chars (URLField default max length)
            let cleanWebsite = '';
            if (provider.website && provider.website !== 'No website available') {
              cleanWebsite = provider.website.substring(0, 200);
            }
            
            // Clean external_id - limit to 100 chars
            let cleanExternalId = '';
            if (provider.place_id) {
              cleanExternalId = provider.place_id.substring(0, 100);
            } else if (provider.id) {
              cleanExternalId = provider.id.toString().substring(0, 100);
            }
            
            // Clean provider_type - limit to 100 chars
            let cleanProviderType = '';
            if (provider.types && provider.types.length > 0) {
              cleanProviderType = provider.types[0].substring(0, 100);
            }
            
            return {
              name: provider.name.substring(0, 100), // Limit name to 100 chars
              phone_number: cleanPhone,
              website: cleanWebsite,
              rating: provider.rating || 0,
              user_rating_count: provider.user_rating_count || 0,
              address: provider.address ? provider.address.substring(0, 255) : '', // Limit address to 255 chars
              description: provider.description || '',
              tags: provider.tags || [],
              coordinates: provider.coordinates || {},
              place_id: cleanExternalId,
              provider_type: cleanProviderType
            };
          });
          
          // Save each cleaned provider
          const savePromises = cleanedProviders.map(provider => 
            eventService.createProviderFromApi({
              event_id: createdEventId,
              provider_data: provider
            })
          );
          
          await Promise.all(savePromises);
          
          // Redirect to the dashboard with success message
          navigate('/dashboard', { 
            state: { 
              success: true, 
              message: 'Event created successfully with selected providers!' 
            } 
          });
          
        } catch (err) {
          console.error('Failed to save providers:', err);
          setError('Event created but failed to save providers. You can add them later.');
          
          // Redirect anyway since the event was created
          navigate('/dashboard', { 
            state: { 
              success: true, 
              warning: true,
              message: 'Event created successfully, but there was an issue saving providers.' 
            } 
          });
        } finally {
          setLoading(false);
        }
      } else {
        // No providers selected, just redirect
        navigate('/dashboard', { 
          state: { 
            success: true, 
            message: 'Event created successfully!' 
          } 
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Go back to category selection
      navigate('/create-event');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  if (error) {
    return (
      <div className="wizard-error">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/create-event')} className="back-button">
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="event-creation-wizard">
      <div className="wizard-header">
        <h1>Create Your Event</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>
        <h2>
          Step {currentStep}: 
          {currentStep === 1 ? ' Basic Information' : currentStep === 2 ? ' Service Providers' : ''}
        </h2>
        {category && <div className="selected-category">Category: {category.name}</div>}
      </div>
      
      <div className="wizard-content">
        {currentStep === 1 && (
          <div className="wizard-step">
            <div className="forum-group-cr-events">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter your event title"
                value={formData.title}
                onChange={handleInputChange}
                className={validationErrors.title ? 'error' : ''}
              />
              {validationErrors.title && (
                <div className="error-message">{validationErrors.title}</div>
              )}
            </div>
            
            <div className="forum-group-cr-events">
              <label htmlFor="start_date">Event Date</label>
              <DatePicker
                selected={formData.start_date}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className={validationErrors.start_date ? 'error' : ''}
              />
              {validationErrors.start_date && (
                <div className="error-message">{validationErrors.start_date}</div>
              )}
            </div>
            
            <div className="forum-group-cr-events">
              <label htmlFor="location">Event Location</label>
              <LocationSearch 
                onLocationSelect={handleLocationSelect} 
              />
              {validationErrors.location && (
                <div className="error-message">{validationErrors.location}</div>
              )}
            </div>
            
            <div className="forum-group-cr-events">
              <label htmlFor="expected_attendance">Expected Attendance</label>
              <input
                type="number"
                id="expected_attendance"
                name="expected_attendance"
                placeholder="Number of attendees"
                min="0"
                value={formData.expected_attendance}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="forum-group-cr-events">
              <label htmlFor="budget">Budget (in $)</label>
              <input
                type="number"
                id="budget"
                name="budget"
                placeholder="Event budget"
                min="0"
                value={formData.budget}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="wizard-step">
            <ServiceProvidersSelection 
              eventData={{
                title: formData.title,
                category: category,
                location: formData.location
              }}
              onProviderSelect={handleProviderSelect}
            />
            
            <div className="providers-note">
              <p>
                Note: You can select multiple service providers or none at all. 
                You can always add or remove providers later.
              </p>
              <p className="api-note">
                If service providers cannot be loaded, you can continue without selecting any.
                The service might be temporarily unavailable or your location might not have any providers in our database.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="wizard-footer">
        <button 
          className="back-button" 
          onClick={handleBack}
          disabled={loading}
        >
          Back
        </button>
        
        <button 
          className="next-button" 
          onClick={handleNextStep}
          disabled={loading}
        >
          {loading 
            ? (currentStep === 1 ? 'Creating...' : 'Saving...') 
            : (currentStep === 2 ? 'Finish' : 'Next')}
        </button>
      </div>
    </div>
  );
};

export default EventCreationWizard; 