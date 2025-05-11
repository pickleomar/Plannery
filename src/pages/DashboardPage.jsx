import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Plannery</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <main className="dashboard-content">
        <h2>Your Dashboard</h2>
        <p>Welcome to Plannery! Your event planning journey begins here.</p>
        <div className="placeholder-content">
          <p>Dashboard content coming soon...</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 