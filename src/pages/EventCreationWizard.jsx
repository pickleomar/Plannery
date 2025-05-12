import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LocationSearch from '../components/events/LocationSearch';
import eventService from '../services/eventService';
import './EventCreationWizard.css';

const EventCreationWizard = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);

  // Form data for all steps
  const [formData, setFormData] = useState({
    title: '',
    category: categoryId,
    start_date: new Date(),
    location: null,
    expected_attendance: 0,
    budget: 0
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      const isValidStep1 = validateStep1();
      if (!isValidStep1) return;
      
      // For now we just log the data since we only have one step
      console.log('Event data from step 1:', formData);
      
      // Here you'd either go to step 2 or submit if only one step
      // setCurrentStep(2);
      
      // For demo purposes, let's try to create the event
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
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
      
      // Redirect to the dashboard or event details page
      navigate('/dashboard', { 
        state: { 
          success: true, 
          message: 'Event created successfully!' 
        } 
      });
      
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create the event. Please try again.');
    } finally {
      setLoading(false);
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
        <h2>Step {currentStep}: {currentStep === 1 ? 'Basic Information' : ''}</h2>
        {category && <div className="selected-category">Category: {category.name}</div>}
      </div>
      
      <div className="wizard-content">
        {currentStep === 1 && (
          <div className="wizard-step">
            <div className="form-group">
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
            
            <div className="form-group">
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
            
            <div className="form-group">
              <label htmlFor="location">Event Location</label>
              <LocationSearch 
                onLocationSelect={handleLocationSelect} 
              />
              {validationErrors.location && (
                <div className="error-message">{validationErrors.location}</div>
              )}
            </div>
            
            <div className="form-group">
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
          {loading ? 'Creating...' : currentStep === 3 ? 'Create Event' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default EventCreationWizard; 