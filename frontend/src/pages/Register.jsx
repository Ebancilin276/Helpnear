import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Briefcase, UserCheck, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const Register = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (formError) setFormError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">Account Creation</div>
          <h2 className="auth-title">Join HelpNear</h2>
          <p className="auth-subtitle">
            Connect with verified local help or offer your skills to neighbors
          </p>
        </div>

        {formError && (
          <div className="alert alert-error" id="register-error-alert">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="register-name" className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="register-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="register-email" className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="register-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="register-password" className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="register-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Account Type</label>
            <div className="role-selector-grid">
              <div
                id="role-customer"
                className={`role-option-card ${formData.role === 'customer' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('customer')}
              >
                <div className="role-option-icon">
                  <UserCheck size={20} />
                </div>
                <div className="role-option-info">
                  <div className="role-option-title">Customer</div>
                  <div className="role-option-desc">Need assistance, repairs & services</div>
                </div>
              </div>

              <div
                id="role-provider"
                className={`role-option-card ${formData.role === 'provider' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('provider')}
              >
                <div className="role-option-icon">
                  <Briefcase size={20} />
                </div>
                <div className="role-option-info">
                  <div className="role-option-title">Service Provider</div>
                  <div className="role-option-desc">Electrician, plumber, mechanic, etc.</div>
                </div>
              </div>
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-block submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button
            id="switch-to-login-btn"
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
