import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/Plannery.png';
import './Navigation.css';


const Navigation = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">
            <img src={logo} alt="Plannery Logo" className="logo-image" />
          </Link>
        </div>
        
        <div className="nav-links">
          {isAuthenticated() ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/events" className="nav-link">Events</Link>
              <button onClick={handleLogout} className="nav-logout">Logout</button>
              <div className="user-avatar">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 