import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import './DashboardPage.css';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(
    location.state?.success ? { type: 'success', message: location.state.message } : null
  );
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  useEffect(() => {
    fetchUserEvents();
    
    // Clear location state after reading it
    if (location.state?.success) {
      window.history.replaceState({}, document.title);
    }
  }, []);
  
  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getUserEvents();
      setUserEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleChoiceEvent = () => {
    navigate('/choice');
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleDeleteConfirmation = (event) => {
    setDeleteConfirmation(event);
  };

  const handleDeleteEvent = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await eventService.deleteEvent(deleteConfirmation.id);
      setNotification({ type: 'success', message: 'Event deleted successfully!' });
      // Refresh the events list
      fetchUserEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setNotification({ type: 'error', message: 'Failed to delete event' });
    } finally {
      setDeleteConfirmation(null);
    }
  };
  
  return (
    <div className="dashboard">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button className="close-notification" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      
      <main className="dashboard-content">
        <div className="dashboard-actions">
          <h2>Dashboard</h2>
          <button onClick={handleCreateEvent} className="create-event-button">
            <span className="button-icon">+</span> Create New Event
          </button>
        </div>
        
        <div className="events-section">
          <h3>Your Events</h3>
          
          {loading ? (
            <div className="loading-events">Loading your events...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : userEvents.length === 0 ? (
            <div className="no-events">
              <p>You haven't created any events yet.</p>
              <p>Get started by creating your first event!</p>
            </div>
          ) : (
            <div className="events-grid">
              {userEvents.map(event => (
                <div key={event.id} className="event-card">
                  <h4 className="event-title">{event.title}</h4>
                  <div className="event-details">
                    <div className="event-detail">
                      <span className="detail-icon">📅</span>
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="event-detail">
                      <span className="detail-icon">📍</span>
                      <span>{event.location?.main_text || 'Location not specified'}</span>
                    </div>
                    <div className="event-detail">
                      <span className="detail-icon">🏷️</span>
                      <span>{event.category_name}</span>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button 
                      className="event-action-btn view-btn"
                      onClick={() => handleViewEvent(event)}
                    >
                      View
                    </button>
                    <button 
                      className="event-action-btn edit-btn"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="event-action-btn delete-btn"
                      onClick={() => handleDeleteConfirmation(event)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEvent.title}</h3>
              <button className="close-modal" onClick={() => setShowEventDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="event-info-section">
                <h4>Event Details</h4>
                <div className="event-info-item">
                  <span className="info-label">Category:</span>
                  <span>{selectedEvent.category_name}</span>
                </div>
                <div className="event-info-item">
                  <span className="info-label">Date & Time:</span>
                  <span>{formatDate(selectedEvent.start_date)}</span>
                </div>
                <div className="event-info-item">
                  <span className="info-label">End Date & Time:</span>
                  <span>{selectedEvent.end_date ? formatDate(selectedEvent.end_date) : 'Not specified'}</span>
                </div>
                <div className="event-info-item">
                  <span className="info-label">Location:</span>
                  <span>{selectedEvent.location?.description || selectedEvent.location?.main_text || 'Not specified'}</span>
                </div>
                <div className="event-info-item">
                  <span className="info-label">Description:</span>
                  <p>{selectedEvent.description || 'No description provided'}</p>
                </div>
              </div>

              {selectedEvent.service_providers && selectedEvent.service_providers.length > 0 && (
                <div className="event-info-section">
                  <h4>Selected Service Providers</h4>
                  <div className="selected-providers-list">
                    {selectedEvent.service_providers.map((provider, index) => (
                      <div key={index} className="provider-item">
                        <h5>{provider.name}</h5>
                        <div>{provider.address}</div>
                        <div>Rating: {provider.rating} ({provider.user_rating_count} reviews)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="event-action-btn edit-btn"
                onClick={() => {
                  setShowEventDetails(false);
                  handleEditEvent(selectedEvent.id);
                }}
              >
                Edit Event
              </button>
              <button 
                className="close-modal-btn"
                onClick={() => setShowEventDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-modal" onClick={() => setDeleteConfirmation(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the event "{deleteConfirmation.title}"?</p>
              <p className="warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteConfirmation(null)}>Cancel</button>
              <button className="confirm-delete-btn" onClick={handleDeleteEvent}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 