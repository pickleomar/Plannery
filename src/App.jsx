import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EditEventPage from './pages/EditEventPage';
import NotFoundPage from './pages/NotFoundPage';
import InitialChoicePage from './pages/InitialChoicePage';
import CategorySelectionPage from './pages/CategorySelectionPage';
import EventCreationWizard from './pages/EventCreationWizard';
import EventsWizard from './components/events/events-wizard/EventsWizard';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import GuestRoute from './components/routes/GuestRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Layout with nested routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Redirect root to dashboard or login depending on auth state */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/choice" element={<InitialChoicePage />} />
              <Route path="/create-event" element={<CategorySelectionPage />} />
              <Route path="/create-event/:categoryId" element={<EventCreationWizard />} />
              <Route path="/edit-event/:eventId" element={<EditEventPage />} />
              <Route path="/events" element={<EventsWizard/>} /> {/* Placeholder for now */}
              {/* Add more protected routes here */}
            </Route>

            {/* Guest Routes - redirect to dashboard if authenticated */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
            </Route>
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
