import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  User as UserIcon, 
  Activity, 
  Sparkles, 
  Building2, 
  Layers, 
  Users, 
  LayoutDashboard 
} from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, healthStatus }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div 
          className="brand" 
          onClick={() => setCurrentView(user ? 'dashboard' : 'providers')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-icon">
            <Sparkles size={20} className="brand-glow-icon" />
          </div>
          <span className="brand-name">Help<span className="accent">Near</span></span>
          <span className="brand-tag">Day 3 Platform</span>
        </div>

        {/* Center / Navigation Links */}
        <nav className="nav-main-links">
          <button
            id="nav-to-providers"
            className={`nav-link-btn ${currentView === 'providers' ? 'active' : ''}`}
            onClick={() => setCurrentView('providers')}
          >
            <Users size={16} />
            <span>Find Providers</span>
          </button>

          {user && (
            <button
              id="nav-to-dashboard"
              className={`nav-link-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
          )}

          {user?.role === 'provider' && (
            <>
              <button
                id="nav-to-provider-profile"
                className={`nav-link-btn ${currentView === 'provider-profile' ? 'active' : ''}`}
                onClick={() => setCurrentView('provider-profile')}
              >
                <Building2 size={16} />
                <span>My Profile</span>
              </button>

              <button
                id="nav-to-provider-services"
                className={`nav-link-btn ${currentView === 'provider-services' ? 'active' : ''}`}
                onClick={() => setCurrentView('provider-services')}
              >
                <Layers size={16} />
                <span>My Services</span>
              </button>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {/* Health indicator */}
          <div 
            className={`health-badge ${healthStatus?.success ? 'healthy' : 'pending'}`} 
            title={healthStatus?.message || 'Checking backend...'}
          >
            <Activity size={14} className={healthStatus?.success ? 'pulse' : ''} />
            <span>{healthStatus?.success ? 'API Online' : 'Connecting...'}</span>
          </div>

          {user ? (
            <div className="user-profile-nav">
              <div className="user-badge" onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer' }}>
                <UserIcon size={16} />
                <span className="user-name">{user.name}</span>
                <span className={`role-pill role-${user.role || 'customer'}`}>
                  {user.role === 'provider' ? 'Provider' : 'Customer'}
                </span>
              </div>
              <button
                id="navbar-logout-btn"
                className="btn btn-outline btn-sm logout-btn"
                onClick={logout}
                title="Log out of account"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-nav-links">
              <button
                id="nav-to-login"
                className={`btn btn-sm ${currentView === 'login' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCurrentView('login')}
              >
                Login
              </button>
              <button
                id="nav-to-register"
                className={`btn btn-sm ${currentView === 'register' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCurrentView('register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
