import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './Auth.css';

const AuthContainer = ({ initialMode }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Update the mode if the URL changes
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);
  
  const toggleAuthMode = () => {
    const newMode = !isLogin;
    // Change the URL when toggling modes
    navigate(newMode ? '/login' : '/register', { replace: true });
    setIsLogin(newMode);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-illustration">
          <div className="logo-container">
            <div className="logo">Plannery</div>
            <p className="tagline">Your Event Planning Journey Begins Here</p>
          </div>
          <div className="illustration-content">
            {isLogin ? (
              <>
                <h1>Welcome Back!</h1>
                <p>Log in to continue managing your events and creating unforgettable experiences.</p>
              </>
            ) : (
              <>
                <h1>Join Plannery Today!</h1>
                <p>Create beautiful events, connect with service providers, and make your planning journey seamless.</p>
              </>
            )}
            <div className="illustration-image">
              {/* Placeholder for illustration */}
              <div className="event-illustration">
                <div className="illustration-item calendar"></div>
                <div className="illustration-item note"></div>
                <div className="illustration-item people"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-form-section">
          {isLogin ? (
            <Login onToggle={toggleAuthMode} />
          ) : (
            <Register onToggle={toggleAuthMode} />
          )}
        </div>
      </div>
    </div>
  );
};

// Default props
AuthContainer.defaultProps = {
  initialMode: 'login'
};

export default AuthContainer; 