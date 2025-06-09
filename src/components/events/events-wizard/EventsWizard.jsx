import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import eventService from '../../../services/eventService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EventsWizard.css';

const EventsWizard = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state
  const [sortOption, setSortOption] = useState('date-desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAllEvents();
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  
  // Apply search filter and sorting whenever events, searchTerm or sortOption changes
  useEffect(() => {
    if (!events.length) return;
    
    let result = [...events];
    
    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(lowerCaseSearch) || 
        event.category_name.toLowerCase().includes(lowerCaseSearch) ||
        event.organizer_name.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        break;
      case 'date-desc':
        result.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    setFilteredEvents(result);
    setCurrentPage(1); // Reset to first page when search or sort changes
  }, [events, searchTerm, sortOption]);
  
  // Get current events for pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle sort selection
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="events-container">
        <div className="loading-indicator-events">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <div className="error-message">
          <h3>Oops!</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>All Events</h1>
        <p>Discover events organized by our community</p>
      </div>
      
      <div className="events-controls">
        <div className="search-container">
          <FontAwesomeIcon icon="search" className="search-icon" />
          <input 
            type="text" 
            placeholder="Search events by title, category, or organizer" 
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="sort-container">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select" 
            value={sortOption} 
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <h3>No events found</h3>
          <p>{searchTerm ? 'Try different search terms or clear your search' : 'Be the first to create an event!'}</p>
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="events-grid">
            {currentEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="event-category">{event.category_name}</span>
                </div>
                
                <div className="event-details">
                  <div className="event-info">
                    <div className="info-item">
                      <span>
                      <FontAwesomeIcon icon="calendar"/>
                      &nbsp;{formatDate(event.start_date)}
                      </span>
                    </div>
                    <div className="info-item">
                      {/* Budget item if needed */}
                    </div>
                    {event.location && event.location.description && (
                      <div className="info-item">
                        <span>
                        <FontAwesomeIcon icon="location-dot" />
                        &nbsp;{event.location.description}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="event-organizer">
                    <p>Organized by: <strong>{event.organizer_name}</strong></p>
                  </div>
                </div>
                
                <div className="event-actions">
                  <button className="view-details-btn">View Details</button>
                  {currentUser && currentUser.id === event.organizer && (
                    <button className="edit-event-btn">Edit Event</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
          
          <div className="results-summary">
            Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
          </div>
        </>
      )}
    </div>
  );
};

export default EventsWizard; 