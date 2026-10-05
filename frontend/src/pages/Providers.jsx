import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  MapPin, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Tag, 
  RotateCcw,
  Users,
  AlertCircle
} from 'lucide-react';

export const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available service categories for dropdown filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await api.getCategories();
        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Error fetching categories for filter:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch providers from real backend with active filters
  const fetchProviders = useCallback(async (city = selectedCity, service = selectedService) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProviders({ city, service });
      if (data.success && Array.isArray(data.providers)) {
        setProviders(data.providers);
      } else {
        setProviders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load service providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedService]);

  // Initial load
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    setSelectedCity(searchInput.trim());
    fetchProviders(searchInput.trim(), selectedService);
  };

  const handleServiceChange = (e) => {
    const newService = e.target.value;
    setSelectedService(newService);
    fetchProviders(selectedCity, newService);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCity('');
    setSelectedService('');
    fetchProviders('', '');
  };

  return (
    <div className="providers-directory-container">
      {/* Page Hero */}
      <div className="directory-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Users size={16} />
            <span>Public Provider Directory &bull; Day 3 Verified</span>
          </div>
          <h1 className="hero-title">
            Find Trusted Local <span className="accent">Service Providers</span>
          </h1>
          <p className="hero-subtitle">
            Connect directly with verified local tradespeople, electricians, mechanics, and assistance experts in your area.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="filters-glass-card">
          <form onSubmit={handleCitySearch} className="filter-form">
            {/* City search input */}
            <div className="filter-field city-field">
              <label htmlFor="city-search-input" className="filter-label">
                <MapPin size={16} className="text-accent" />
                <span>City / Location</span>
              </label>
              <div className="filter-input-wrap">
                <input
                  id="city-search-input"
                  type="text"
                  placeholder="e.g. Coimbatore"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            {/* Service category select */}
            <div className="filter-field service-field">
              <label htmlFor="service-filter-select" className="filter-label">
                <Filter size={16} className="text-accent" />
                <span>Service Category</span>
              </label>
              <div className="filter-input-wrap">
                <select
                  id="service-filter-select"
                  value={selectedService}
                  onChange={handleServiceChange}
                  className="filter-select"
                >
                  <option value="">All Services ({categories.length})</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search and Reset Buttons */}
            <div className="filter-actions">
              <button
                type="submit"
                id="apply-filter-btn"
                className="btn btn-primary"
              >
                <Search size={16} />
                <span>Search</span>
              </button>

              {(selectedCity || selectedService || searchInput) && (
                <button
                  type="button"
                  id="reset-filter-btn"
                  className="btn btn-ghost"
                  onClick={handleResetFilters}
                  title="Clear all filters"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>

          {/* Active Filter Chips */}
          {(selectedCity || selectedService) && (
            <div className="active-filter-chips">
              <span className="chips-label">Active Filters:</span>
              {selectedCity && (
                <span className="filter-chip">
                  <MapPin size={12} /> City: <strong>{selectedCity}</strong>
                  <button type="button" onClick={() => { setSearchInput(''); setSelectedCity(''); fetchProviders('', selectedService); }}>&times;</button>
                </span>
              )}
              {selectedService && (
                <span className="filter-chip">
                  <Tag size={12} /> Service: <strong>{selectedService}</strong>
                  <button type="button" onClick={() => { setSelectedService(''); fetchProviders(selectedCity, ''); }}>&times;</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-danger" id="directory-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Grid Header */}
      <div className="directory-results-bar">
        <h2 className="results-count">
          {loading ? (
            'Searching providers...'
          ) : (
            <>
              Showing <strong>{providers.length}</strong> {providers.length === 1 ? 'service provider' : 'service providers'}
              {selectedCity && <span> in <strong>{selectedCity}</strong></span>}
              {selectedService && <span> for <strong>{selectedService}</strong></span>}
            </>
          )}
        </h2>
      </div>

      {/* Provider Cards List */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Querying verified local providers from backend...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="empty-directory-card">
          <Building2 size={48} className="empty-icon text-muted" />
          <h3>No Providers Found</h3>
          <p>
            {selectedCity || selectedService 
              ? 'No service providers match the current filters. Try searching for a different city or category.'
              : 'No service providers have registered profiles yet in the system.'}
          </p>
          {(selectedCity || selectedService) && (
            <button 
              id="clear-filters-btn"
              className="btn btn-outline btn-sm"
              onClick={handleResetFilters}
            >
              Clear Filters & Show All
            </button>
          )}
        </div>
      ) : (
        <div className="providers-cards-grid">
          {providers.map(provider => (
            <div 
              key={provider.id} 
              id={`provider-card-${provider.id}`}
              className="card provider-item-card"
            >
              {/* Card Header: Business Name & Status Badges */}
              <div className="provider-header-row">
                <div className="provider-title-group">
                  <div className="provider-avatar-circle">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="provider-business-name">{provider.business_name}</h3>
                    {provider.city && (
                      <div className="provider-city-location">
                        <MapPin size={14} className="text-accent" />
                        <span>{provider.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="provider-status-badges">
                  {/* Availability badge */}
                  <span className={`status-pill ${provider.is_available ? 'available' : 'busy'}`}>
                    {provider.is_available ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} />
                        <span>Off-Duty</span>
                      </>
                    )}
                  </span>

                  {/* Verification badge (only shown if is_verified === true in DB) */}
                  {provider.is_verified ? (
                    <span className="status-pill verified" title="Officially verified credentials">
                      <ShieldCheck size={13} />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="status-pill unverified" title="Standard unverified provider">
                      <span>Unverified</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {provider.description && (
                <p className="provider-description">
                  {provider.description}
                </p>
              )}

              {/* Services Tags List */}
              <div className="provider-services-section">
                <span className="services-section-title">Offered Services:</span>
                {Array.isArray(provider.services) && provider.services.length > 0 ? (
                  <div className="provider-service-tags">
                    {provider.services.map(svc => (
                      <span 
                        key={svc.id} 
                        className={`provider-svc-tag ${selectedService.toLowerCase() === svc.name.toLowerCase() ? 'highlight' : ''}`}
                      >
                        {svc.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="no-services-note text-muted">No specific categories specified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
