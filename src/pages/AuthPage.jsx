import { useLocation } from 'react-router-dom';
import AuthContainer from '../components/auth/AuthContainer';

const AuthPage = () => {
  const location = useLocation();
  
  // Determine initial auth mode based on the URL path
  const isLoginPath = location.pathname === '/login';
  
  return <AuthContainer initialMode={isLoginPath ? 'login' : 'register'} />;
};

export default AuthPage; 