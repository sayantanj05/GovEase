import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ExamsPage from './pages/ExamsPage';
import ExamDetailPage from './pages/ExamDetailPage';
import ExamApplicationPage from './pages/ExamApplicationPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import OpportunityApplicationPage from './pages/OpportunityApplicationPage';
import ApplicationsPage from './pages/ApplicationsPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return isAuthenticated ? <Navigate to="/exams" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/exams" />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
             <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
             <Route path="/exams" element={<ProtectedRoute><ExamsPage /></ProtectedRoute>} />
             <Route path="/exams/:id" element={<ProtectedRoute><ExamDetailPage /></ProtectedRoute>} />
             <Route path="/exams/:id/apply" element={<ProtectedRoute><ExamApplicationPage /></ProtectedRoute>} />
             <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
             <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetailPage /></ProtectedRoute>} />
             <Route path="/opportunities/:id/apply" element={<ProtectedRoute><OpportunityApplicationPage /></ProtectedRoute>} />
             <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
