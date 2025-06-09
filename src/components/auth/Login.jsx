import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = ({ onToggle }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error: authError, clearError } = useAuth();

  // Clear auth errors when unmounting
 useEffect(() => {
    return () => {
      setTimeout(clearError, 2500);
    };
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await login(formData);
      // Login successful, will be handled by the AuthContext
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled in the AuthContext and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container login-container">
      <div className="auth-form-header">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue with your planning journey</p>
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="forum-group-auth">
          <label htmlFor="email">Email</label>
          <div className="input-container">
            <i className="icon email-icon">✉️</i>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="forum-group-auth">
          <label htmlFor="password">Password</label>
          <div className="input-container">
            <i className="icon password-icon">🔒</i>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
          <div className="forgot-password">
            <a href="#reset-password">Forgot Password?</a>
          </div>
        </div>
        
        {authError && (
          <div className="auth-error">
            <i className="error-icon">⚠️</i>
            <span>{authError}</span>
          </div>
        )}
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-form-footer">
        <p>
          Don't have an account? 
          <button 
            type="button" 
            className="toggle-auth-button" 
            onClick={onToggle}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 