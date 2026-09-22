import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { api } from './services/api';
import './App.css';

const MainContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'dashboard'
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

  // Sync currentView with auth state
  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
    } else {
      if (currentView === 'dashboard') {
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

  return (
    <div className="app-layout">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        healthStatus={healthStatus}
      />

      <main className="main-content">
        {user ? (
          <Dashboard />
        ) : currentView === 'register' ? (
          <Register
            onSuccess={() => setCurrentView('dashboard')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        ) : (
          <Login
            onSuccess={() => setCurrentView('dashboard')}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        )}
      </main>

      <footer className="footer">
        <p>HelpNear Platform &bull; Day 2 Authentication &bull; MySQL & Express & React</p>
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
