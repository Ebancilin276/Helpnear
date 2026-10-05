import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  CheckSquare, 
  Square, 
  Layers, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Briefcase,
  Sparkles,
  Info
} from 'lucide-react';

export const ProviderServices = ({ onNavigateToProfile, onNavigateToListing }) => {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [initialLoadedServices, setInitialLoadedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const loadData = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      // 1. Check if provider profile exists
      const profRes = await api.getProviderProfile();
      if (profRes.status === 404) {
        setHasProfile(false);
        setLoading(false);
        return;
      }
      setHasProfile(true);

      // 2. Fetch all service categories (Public route)
      const catData = await api.getCategories();
      const allCategories = catData.categories || [];
      setCategories(allCategories);

      // 3. Fetch provider's currently selected services (Protected route)
      const servData = await api.getProviderServices();
      const myServices = servData.services || [];
      setInitialLoadedServices(myServices);

      // Populate selected IDs set
      const selectedSet = new Set(myServices.map(s => s.id));
      setSelectedIds(selectedSet);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Error loading service data: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCategory = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map(c => c.id)));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const idsArray = Array.from(selectedIds);
      const res = await api.saveProviderServices(idsArray);
      if (res.success) {
        setInitialLoadedServices(res.services || []);
        setStatusMessage({
          type: 'success',
          text: `Successfully updated services! ${idsArray.length} category${idsArray.length === 1 ? '' : 'ies'} assigned to your profile.`
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save services'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading service categories and your selections...</p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="card empty-profile-warning">
        <AlertCircle size={48} className="text-warning" />
        <h2>Provider Profile Required</h2>
        <p>
          You must create your provider profile with business name and contact information before selecting service categories.
        </p>
        <button 
          id="create-profile-first-btn"
          className="btn btn-primary"
          onClick={onNavigateToProfile}
        >
          Create Provider Profile Now &rarr;
        </button>
      </div>
    );
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="services-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-text">
          <div className="header-tag">
            <Layers size={16} />
            <span>Day 3 Service Category Management</span>
          </div>
          <h1 className="page-title">Service Categories & Skills</h1>
          <p className="page-subtitle">
            Select all the service categories your business offers. Customers will find your business when filtering by these services.
          </p>
        </div>

        <div className="header-actions">
          <button
            id="save-services-top-btn"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Selections ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div 
          id="services-feedback-alert"
          className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Overview & Currently Active Services Bar */}
      <div className="card active-services-summary-card">
        <div className="summary-header">
          <div className="summary-title-group">
            <Briefcase size={20} className="text-accent" />
            <h3>Currently Offered Services ({initialLoadedServices.length})</h3>
          </div>
          <button 
            type="button" 
            className="btn btn-ghost btn-sm"
            onClick={handleSelectAll}
          >
            {selectedIds.size === categories.length ? 'Deselect All' : 'Select All Categories'}
          </button>
        </div>

        {initialLoadedServices.length === 0 ? (
          <p className="text-muted empty-state-note">
            No services currently selected. Check one or more categories below and click <strong>Save Selections</strong>.
          </p>
        ) : (
          <div className="active-tags-list">
            {initialLoadedServices.map(s => (
              <span key={s.id} className="service-tag active-tag">
                <CheckCircle2 size={13} className="text-success" />
                <span>{s.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Categories */}
      <div className="categories-grid-section">
        <div className="section-header">
          <h2>Available Standard Categories ({categories.length})</h2>
          <span className="selection-counter-badge">
            {selectedCount} of {categories.length} selected
          </span>
        </div>

        <div className="categories-card-grid">
          {categories.map(cat => {
            const isSelected = selectedIds.has(cat.id);
            return (
              <div 
                key={cat.id} 
                id={`category-card-${cat.id}`}
                className={`category-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="category-checkbox-wrapper">
                  {isSelected ? (
                    <CheckSquare size={22} className="check-icon selected" />
                  ) : (
                    <Square size={22} className="check-icon unselected" />
                  )}
                </div>

                <div className="category-text">
                  <div className="category-name-row">
                    <h4 className="category-name">{cat.name}</h4>
                    {isSelected && <span className="active-mini-pill">Selected</span>}
                  </div>
                  <p className="category-desc">
                    {cat.description || 'Specialized local home and field service'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating/Fixed Save Bar */}
      <div className="bottom-save-bar">
        <div className="bottom-bar-info">
          <Sparkles size={18} className="text-accent" />
          <span>
            <strong>{selectedCount}</strong> {selectedCount === 1 ? 'service category' : 'service categories'} selected for your business
          </span>
        </div>

        <div className="bottom-bar-actions">
          {onNavigateToListing && (
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onNavigateToListing}
            >
              View in Public Directory
            </button>
          )}
          <button
            id="save-services-bottom-btn"
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>Saving Services...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Selected Services</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
