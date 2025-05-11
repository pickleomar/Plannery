import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Register = ({ onToggle }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    role: 'ORGANIZER',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error: authError, clearError } = useAuth();

  // Clear auth errors when unmounting
  useEffect(() => {
    return () => {
      clearError();
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await register(formData);
      // Registration successful, handled by AuthContext
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is handled in AuthContext and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container register-container">
      <div className="auth-form-header">
        <h2>Create an Account</h2>
        <p>Start your journey with Plannery today</p>
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
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
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <div className="input-container">
            <i className="icon username-icon">👤</i>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <div className="input-container">
            <i className="icon role-icon">🏆</i>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="ORGANIZER">Event Organizer</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-container">
            <i className="icon password-icon">🔒</i>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password_confirm">Confirm Password</label>
          <div className="input-container">
            <i className="icon password-icon">🔒</i>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              placeholder="Confirm your password"
              value={formData.password_confirm}
              onChange={handleChange}
              className={errors.password_confirm ? 'error' : ''}
              disabled={isSubmitting}
            />
          </div>
          {errors.password_confirm && <span className="error-message">{errors.password_confirm}</span>}
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
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="auth-form-footer">
        <p>
          Already have an account? 
          <button 
            type="button" 
            className="toggle-auth-button" 
            onClick={onToggle}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register; 