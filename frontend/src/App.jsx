import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProviderProfile } from './pages/ProviderProfile';
import { ProviderServices } from './pages/ProviderServices';
import { Providers } from './pages/Providers';
import { api } from './services/api';
import './App.css';

const MainContent = () => {
  const { user, loading } = useAuth();
  // View states: 'providers' | 'dashboard' | 'provider-profile' | 'provider-services' | 'login' | 'register'
  const [currentView, setCurrentView] = useState('providers');
  const [healthStatus, setHealthStatus] = useState(null);

  // Check health status on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const data = await api.getHealth();
        setHealthStatus(data);
      } catch (err) {
        setHealthStatus({ success: false, message: 'Backend unreachable' });
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, []);

  // When user signs in or out, intelligently set view if appropriate
  useEffect(() => {
    if (!user) {
      if (currentView === 'dashboard' || currentView === 'provider-profile' || currentView === 'provider-services') {
        setCurrentView('login');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying secure session...</p>
      </div>
    );
  }

  // Render view depending on currentView and authentication state
  const renderCurrentView = () => {
    // Public directory is accessible whether authenticated or not
    if (currentView === 'providers') {
      return <Providers />;
    }

    // Authenticated views
    if (user) {
      if (currentView === 'provider-profile') {
        if (user.role === 'provider') {
          return (
            <ProviderProfile 
              onNavigateToServices={() => setCurrentView('provider-services')} 
            />
          );
        }
        return <Dashboard onNavigate={setCurrentView} />;
      }

      if (currentView === 'provider-services') {
        if (user.role === 'provider') {
          return (
            <ProviderServices 
              onNavigateToProfile={() => setCurrentView('provider-profile')}
              onNavigateToListing={() => setCurrentView('providers')}
            />
          );
        }
        return <Dashboard onNavigate={setCurrentView} />;
      }

      // Default authenticated view: Dashboard
      return <Dashboard onNavigate={setCurrentView} />;
    }

    // Unauthenticated views
    if (currentView === 'register') {
      return (
        <Register
          onSuccess={() => setCurrentView('dashboard')}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      );
    }

    return (
      <Login
        onSuccess={() => setCurrentView('dashboard')}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  };

  return (
    <div className="app-layout">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        healthStatus={healthStatus}
      />

      <main className="main-content">
        {renderCurrentView()}
      </main>

      <footer className="footer">
        <p>HelpNear Platform &bull; Day 3 Provider Directory &bull; MySQL & Express & React</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
