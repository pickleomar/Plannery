import { useNavigate } from 'react-router-dom';
import './InitialChoicePage.css';

const InitialChoicePage = () => {
  const navigate = useNavigate();
  
  const handleCreateEvent = () => {
    navigate('/create-event');
  };
  
  const handleFindEvent = () => {
    navigate('/events');
  };
  
  return (
    <div className="initial-choice-page">
      <div className="choice-container">
        <h1>What would you like to do?</h1>
        <p className="choice-subtitle">Choose an option to get started with your event planning journey</p>
        
        <div className="choice-cards">
          <div className="choice-card" onClick={handleCreateEvent}>
            <div className="choice-card-icon create-icon">✨</div>
            <h2>Create an Event</h2>
            <p>Plan and organize your own event from scratch</p>
            <button className="choice-button create-button">Get Started</button>
          </div>
          
          <div className="choice-card" onClick={handleFindEvent}>
            <div className="choice-card-icon find-icon">🔍</div>
            <h2>Find an Event</h2>
            <p>Discover and join events in your area</p>
            <button className="choice-button find-button">Explore Events</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialChoicePage; 