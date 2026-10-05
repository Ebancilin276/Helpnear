import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw,
  Compass
} from 'lucide-react';

export const ProviderProfile = ({ onNavigateToServices }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Form fields
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    description: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    is_available: true
  });

  const loadProfile = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await api.getProviderProfile();
      if (res.status === 200 && res.data.provider) {
        const p = res.data.provider;
        setProfile(p);
        setFormData({
          business_name: p.business_name || '',
          phone: p.phone || '',
          description: p.description || '',
          address: p.address || '',
          city: p.city || '',
          latitude: p.latitude !== null && p.latitude !== undefined ? p.latitude : '',
          longitude: p.longitude !== null && p.longitude !== undefined ? p.longitude : '',
          is_available: Boolean(p.is_available)
        });
        setIsNewProfile(false);
      } else if (res.status === 404) {
        setIsNewProfile(true);
        setFormData(prev => ({
          ...prev,
          business_name: user?.name ? `${user.name}'s Services` : ''
        }));
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Error loading profile: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleAvailability = () => {
    setFormData(prev => ({
      ...prev,
      is_available: !prev.is_available
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    if (!formData.business_name.trim() || !formData.phone.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Business name and contact phone number are required.'
      });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        business_name: formData.business_name.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
        is_available: formData.is_available
      };

      let res;
      if (isNewProfile) {
        res = await api.createProviderProfile(payload);
        setStatusMessage({
          type: 'success',
          text: 'Provider profile created successfully!'
        });
        setIsNewProfile(false);
      } else {
        res = await api.updateProviderProfile(payload);
        setStatusMessage({
          type: 'success',
          text: 'Provider profile updated successfully!'
        });
      }

      if (res.provider) {
        setProfile(res.provider);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save provider profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your provider profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-text">
          <div className="header-tag">
            <Building2 size={16} />
            <span>Day 3 Provider Management</span>
          </div>
          <h1 className="page-title">
            {isNewProfile ? 'Create Provider Profile' : 'Provider Profile & Availability'}
          </h1>
          <p className="page-subtitle">
            Configure your local business identity, service location, and on-duty availability for nearby customers.
          </p>
        </div>

        {profile && onNavigateToServices && (
          <div className="header-actions">
            <button 
              id="go-to-services-btn" 
              className="btn btn-outline"
              onClick={onNavigateToServices}
            >
              Configure Offered Services &rarr;
            </button>
          </div>
        )}
      </div>

      {statusMessage.text && (
        <div 
          id="profile-feedback-alert"
          className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Form & Status Grid */}
      <div className="profile-layout-grid">
        {/* Left Column: Form */}
        <div className="card profile-form-card">
          <div className="card-header">
            <h2 className="card-title">Business Information</h2>
            <span className="badge-badge">
              {isNewProfile ? 'New Profile' : 'Active Profile'}
            </span>
          </div>

          <form id="provider-profile-form" onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="business_name" className="form-label">
                Business / Trade Name <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon" />
                <input
                  id="business_name"
                  type="text"
                  name="business_name"
                  className="form-input"
                  placeholder="e.g. Coimbatore Rapid Electricians"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Contact Phone Number <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  Service City <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    id="city"
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="e.g. Coimbatore"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Service Address / Operational Base
              </label>
              <input
                id="address"
                type="text"
                name="address"
                className="form-input"
                placeholder="e.g. 42 Cross Cut Road, Gandhipuram"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description of Services
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="form-textarea"
                placeholder="Describe your expertise, experience, and the local areas you cover..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Coordinates preparation (Day 3 requirement: preparation for future maps, not active yet) */}
            <div className="form-section-divider">
              <span>Location Coordinates (Day 3 Map Prep)</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude" className="form-label">
                  Latitude <span className="text-muted">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <Compass size={18} className="input-icon" />
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    className="form-input"
                    placeholder="e.g. 11.0168"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="longitude" className="form-label">
                  Longitude <span className="text-muted">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <Compass size={18} className="input-icon" />
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    className="form-input"
                    placeholder="e.g. 76.9558"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="availability-card" onClick={toggleAvailability}>
              <div className="availability-info">
                <span className="availability-title">On-Duty Availability Status</span>
                <span className="availability-subtitle">
                  {formData.is_available 
                    ? 'Currently Available to receive local customer requests' 
                    : 'Currently Busy / Off-Duty (hidden from active listings)'}
                </span>
              </div>
              <button 
                type="button" 
                id="toggle-availability-btn"
                className={`toggle-btn ${formData.is_available ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAvailability();
                }}
              >
                {formData.is_available ? (
                  <ToggleRight size={34} className="toggle-icon on" />
                ) : (
                  <ToggleLeft size={34} className="toggle-icon off" />
                )}
              </button>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                id="save-profile-btn"
                className="btn btn-primary btn-lg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{isNewProfile ? 'Create Provider Profile' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Status & Security Verification Card */}
        <div className="profile-side-column">
          {/* Read-only Verification Badge Card */}
          <div className="card verification-card">
            <div className="card-header">
              <h3 className="card-title">Verification Status</h3>
              <span className="read-only-pill">Read-Only</span>
            </div>

            <div className="card-body">
              <div className="verification-state-box">
                {profile?.is_verified ? (
                  <div className="verified-badge-large">
                    <ShieldCheck size={36} className="text-success" />
                    <div>
                      <strong className="text-success">Verified Provider</strong>
                      <p>Your business credentials have been officially verified.</p>
                    </div>
                  </div>
                ) : (
                  <div className="unverified-badge-large">
                    <ShieldAlert size={36} className="text-warning" />
                    <div>
                      <strong className="text-warning">Pending Verification</strong>
                      <p>
                        New provider profiles default to unverified (<code>is_verified = false</code>). 
                        Provider cannot manually toggle verification.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="day3-guardrail-notice">
                <span className="notice-title">🛡️ Day 3 Security Rule:</span>
                <p>
                  API endpoints explicitly ignore any attempt by the provider to modify <code>is_verified</code> or <code>user_id</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Account Meta Card */}
          <div className="card meta-info-card">
            <div className="card-header">
              <h3 className="card-title">Account Association</h3>
            </div>
            <div className="card-body">
              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">Provider Name:</span>
                  <span className="meta-value">{user?.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Account Email:</span>
                  <span className="meta-value">{user?.email}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">System Role:</span>
                  <span className="role-pill role-provider">Provider</span>
                </div>
                {profile && (
                  <div className="meta-row">
                    <span className="meta-label">Profile ID:</span>
                    <span className="meta-value">#{profile.id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
