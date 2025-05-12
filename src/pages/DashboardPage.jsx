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
    navigate('/choice');
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <h2>Your Dashboard</h2>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 