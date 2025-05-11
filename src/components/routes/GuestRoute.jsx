import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const GuestRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (isAuthenticated()) {
    // Redirect to the intended destination or dashboard
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default GuestRoute; 