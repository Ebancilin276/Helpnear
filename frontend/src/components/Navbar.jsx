import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon, Activity, Sparkles } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, healthStatus }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand" onClick={() => setCurrentView(user ? 'dashboard' : 'login')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Sparkles size={20} className="brand-glow-icon" />
          </div>
          <span className="brand-name">Help<span className="accent">Near</span></span>
          <span className="brand-tag">Day 2 Auth</span>
        </div>

        <div className="nav-actions">
          {/* Health indicator */}
          <div className={`health-badge ${healthStatus?.success ? 'healthy' : 'pending'}`} title={healthStatus?.message || 'Checking backend...'}>
            <Activity size={14} className={healthStatus?.success ? 'pulse' : ''} />
            <span>{healthStatus?.success ? 'API Online' : 'Connecting...'}</span>
          </div>

          {user ? (
            <div className="user-profile-nav">
              <div className="user-badge">
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
