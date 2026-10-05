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
  Server,
  Building2,
  Layers,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Dashboard = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [providerProfile, setProviderProfile] = useState(null);

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

    if (user?.role === 'provider') {
      api.getProviderProfile()
        .then(res => {
          if (res.status === 200 && res.data.provider) {
            setProviderProfile(res.data.provider);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const activeUser = profileData || user;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="welcome-tag">
            <ShieldCheck size={16} />
            <span>Authenticated Session (Day 2 & Day 3 Ready)</span>
          </div>
          <h1 className="welcome-title">
            Welcome back, <span className="highlight-name">{activeUser?.name || 'User'}</span>!
          </h1>
          <p className="welcome-subtitle">
            You are securely logged in as a <strong>{activeUser?.role === 'provider' ? 'Service Provider' : 'Customer'}</strong> with a validated JWT.
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

      {/* Day 3 Provider Quick Action Cards (If Provider) */}
      {activeUser?.role === 'provider' ? (
        <div className="card provider-quick-hub-card">
          <div className="card-header">
            <div className="title-with-icon">
              <Sparkles size={20} className="text-accent" />
              <h3 className="card-title">Provider Management Center (Day 3)</h3>
            </div>
            <span className="badge-badge">Provider Portal</span>
          </div>

          <div className="provider-hub-grid">
            <div 
              className="hub-action-box" 
              onClick={() => onNavigate && onNavigate('provider-profile')}
            >
              <div className="hub-box-icon">
                <Building2 size={24} />
              </div>
              <div className="hub-box-content">
                <h4>Provider Profile & Availability</h4>
                <p>
                  {providerProfile 
                    ? `Business: ${providerProfile.business_name} (${providerProfile.is_available ? 'Available' : 'Busy'})`
                    : 'Set up your business name, contact phone, city, and on-duty availability.'}
                </p>
              </div>
              <button 
                id="dash-goto-profile-btn"
                className="btn btn-ghost btn-sm"
              >
                <span>Edit Profile</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div 
              className="hub-action-box" 
              onClick={() => onNavigate && onNavigate('provider-services')}
            >
              <div className="hub-box-icon">
                <Layers size={24} />
              </div>
              <div className="hub-box-content">
                <h4>Service Categories & Skills</h4>
                <p>Select which of the 15 standard local service categories your business provides.</p>
              </div>
              <button 
                id="dash-goto-services-btn"
                className="btn btn-ghost btn-sm"
              >
                <span>Manage Services</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div 
              className="hub-action-box" 
              onClick={() => onNavigate && onNavigate('providers')}
            >
              <div className="hub-box-icon">
                <Users size={24} />
              </div>
              <div className="hub-box-content">
                <h4>Public Provider Directory</h4>
                <p>See how your profile and services appear to customers filtering by city or service.</p>
              </div>
              <button 
                id="dash-goto-directory-btn"
                className="btn btn-ghost btn-sm"
              >
                <span>Browse Directory</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Customer Action Card */
        <div className="card customer-action-card">
          <div className="customer-action-content">
            <div className="action-text">
              <h3>Need local help or professional services?</h3>
              <p>Explore electricians, mechanics, plumbers, and local assistance providers in your city.</p>
            </div>
            <button 
              id="dash-customer-find-btn"
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate && onNavigate('providers')}
            >
              <Users size={18} />
              <span>Browse All Service Providers &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: User Profile & Security Status */}
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
            <h3 className="card-title">Day 3 System Status</h3>
            <span className="status-indicator-badge live">Operational</span>
          </div>

          <div className="card-body">
            <div className="security-checks-list">
              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Provider Profile API:</strong> Protected with JWT + Provider role check (HTTP 403 on Customer)
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Service Categories:</strong> 15 standard seeded categories available via public API
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Provider Services Mapping:</strong> Multi-service selection with duplicate prevention
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Public Directory:</strong> City and Service filters without sensitive credential leakage
                </div>
              </div>

              <div className="check-row">
                <CheckCircle2 size={18} className="check-icon text-success" />
                <div className="check-info">
                  <strong>Security Guardrail:</strong> <code>is_verified</code> read-only and preserved
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
