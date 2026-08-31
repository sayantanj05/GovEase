import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Welcome to GovEase AI</h2>
        <div className="user-info">
          <h3>Your Profile</h3>
          <div className="info-row">
            <span className="label">User ID:</span>
            <span className="value user-id">{user?._id}</span>
          </div>
          <div className="info-row">
            <span className="label">Full Name:</span>
            <span className="value">{user?.fullName}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Phone:</span>
            <span className="value">{user?.phone || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="label">Role:</span>
            <span className="value">{user?.role}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className="value status-active">{user?.status}</span>
          </div>
          <div className="info-row">
            <span className="label">Email Verified:</span>
            <span className="value">{user?.emailVerified ? 'Yes' : 'No'}</span>
          </div>
          <div className="info-row">
            <span className="label">User Since:</span>
            <span className="value">{new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
