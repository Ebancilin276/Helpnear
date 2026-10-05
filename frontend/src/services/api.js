const API_BASE = '/api';

/**
 * Helper to build headers with auth token if available
 */
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('helpnear_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const api = {
  // Health check
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Register
  async register({ name, email, password, role }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  // Login
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  // Get current user (protected route)
  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }
    return data;
  },

  // --- DAY 3 PROVIDER & SERVICES APIs ---

  // Get logged-in provider's own profile (protected, provider-only)
  async getProviderProfile() {
    const res = await fetch(`${API_BASE}/providers/profile`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  },

  // Create provider profile (protected, provider-only)
  async createProviderProfile(profileData) {
    const res = await fetch(`${API_BASE}/providers/profile`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create provider profile');
    }
    return data;
  },

  // Update provider profile (protected, provider-only)
  async updateProviderProfile(profileData) {
    const res = await fetch(`${API_BASE}/providers/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update provider profile');
    }
    return data;
  },

  // Get all standard service categories (public)
  async getCategories() {
    const res = await fetch(`${API_BASE}/services/categories`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch service categories');
    }
    return data;
  },

  // Get services selected by authenticated provider (protected, provider-only)
  async getProviderServices() {
    const res = await fetch(`${API_BASE}/providers/services`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch provider services');
    }
    return data;
  },

  // Select / save services for authenticated provider (protected, provider-only)
  async saveProviderServices(serviceCategoryIds) {
    const res = await fetch(`${API_BASE}/providers/services`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ service_category_ids: serviceCategoryIds })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save provider services');
    }
    return data;
  },

  // Get public providers directory with optional filters (public)
  async getProviders({ city = '', service = '' } = {}) {
    const params = new URLSearchParams();
    if (city && city.trim()) params.append('city', city.trim());
    if (service && service.trim()) params.append('service', service.trim());

    const url = `${API_BASE}/providers${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch providers');
    }
    return data;
  }
};

