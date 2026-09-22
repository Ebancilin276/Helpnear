import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Briefcase, 
  LogOut, 
  CheckCircle2, 
  Key, 
  Database, 
  RefreshCw,
  Server
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');

  // Fetch fresh profile from protected route /api/auth/me
  const fetchFreshProfile = async () => {
    setIsLoadingProfile(true);
    setProfileMessage('');
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setProfileData(res.user);
        setProfileMessage('Protected route /api/auth/me verified successfully!');
      }
    } catch (err) {
      setProfileMessage(`Error verifying protected route: ${err.message}`);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchFreshProfile();
    api.getHealth()
      .then(setApiHealth)
      .catch(() => setApiHealth({ success: false, message: 'Backend unreachable' }));
  }, []);

  const activeUser = profileData || user;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="welcome-tag">
            <ShieldCheck size={16} />
            <span>Authenticated Session (Day 2 Verified)</span>
          </div>
          <h1 className="welcome-title">
            Welcome back, <span className="highlight-name">{activeUser?.name || 'User'}</span>!
          </h1>
          <p className="welcome-subtitle">
            You are securely logged in with a validated JSON Web Token.
          </p>
        </div>

        <div className="welcome-actions">
          <button
            id="dashboard-logout-btn"
            className="btn btn-danger"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {profileMessage && (
        <div className="alert alert-success" id="me-route-feedback">
          <CheckCircle2 size={18} />
          <span>{profileMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* User Profile Card */}
        <div className="card profile-card">
          <div className="card-header">
            <h3 className="card-title">User Account Profile</h3>
            <span className={`role-pill role-${activeUser?.role || 'customer'}`}>
              {activeUser?.role === 'provider' ? 'Service Provider' : 'Customer'}
            </span>
          </div>

          <div className="card-body">
            <div className="profile-details-list">
              <div className="detail-item">
                <div className="detail-icon">
                  <User size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value" id="user-display-name">{activeUser?.name}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Mail size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value" id="user-display-email">{activeUser?.email}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  {activeUser?.role === 'provider' ? <Briefcase size={18} /> : <ShieldCheck size={18} />}
                </div>
                <div className="detail-content">
                  <span className="detail-label">Assigned Role</span>
                  <span className="detail-value" id="user-display-role" style={{ textTransform: 'capitalize' }}>
                    {activeUser?.role || 'customer'}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Key size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Database User ID</span>
                  <span className="detail-value" id="user-display-id">#{activeUser?.id}</span>
                </div>
              </div>
            </div>

            <div className="profile-card-footer">
              <button
                id="verify-me-btn"
                className="btn btn-outline btn-block"
                onClick={fetchFreshProfile}
                disabled={isLoadingProfile}
              >
                <RefreshCw size={16} className={isLoadingProfile ? 'spin' : ''} />
                <span>Re-verify Protected Route (/api/auth/me)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Verification Matrix Status Card */}
        <div className="card status-card">
          <div className="card-header">
            <h3 className="card-title">Day 2 Security Status</h3>
            <span className="status-indicator-badge live">Live & Secure</span>
          </div>

          <div className="card-body">
            <div className="security-checks-list">
              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Bcrypt Hashing:</strong> Passwords hashed with salt rounds in MySQL
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>JWT Generation:</strong> Signed token stored in client localStorage
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Protected Route:</strong> <code>GET /api/auth/me</code> authenticated via middleware
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Role Isolation:</strong> Customer vs Provider roles properly assigned
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>No Leakage:</strong> Passwords excluded from all API responses
                </div>
              </div>
            </div>

            <div className="system-health-banner">
              <div className="health-stat">
                <Server size={18} />
                <span>Backend Port: <strong>5000</strong></span>
              </div>
              <div className="health-stat">
                <Database size={18} />
                <span>Database: <strong>MySQL helpnear_db</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
