// API Client for ArtifactVault Express + MongoDB Backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-state-change'));
  },
  getUser: () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('auth-state-change'));
  },

  auth: {
    signup: async (data) => {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || data.fullName,
          email: data.email,
          password: data.password,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Signup failed');
      }
      if (result.token) {
        api.setToken(result.token);
      }
      if (result.user) {
        api.setUser(result.user);
      }
      return result;
    },

    login: async (data) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Login failed');
      }
      if (result.token) {
        api.setToken(result.token);
      }
      if (result.user) {
        api.setUser(result.user);
      }
      return result;
    },

    getMe: async () => {
      const token = api.getToken();
      if (!token) return null;
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: getHeaders(true),
        });
        if (!res.ok) {
          api.clearAuth();
          return null;
        }
        const result = await res.json();
        if (result.user) {
          api.setUser(result.user);
          return result.user;
        }
        return null;
      } catch (err) {
        console.error('getMe error:', err);
        return null;
      }
    },

    getProfile: async () => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: getHeaders(true),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch user profile');
      }
      return result.user;
    },

    logout: () => {
      api.clearAuth();
    },
  },

  artifacts: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/artifacts`, {
        headers: getHeaders(true),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch artifacts');
      }
      return (result.artifacts || []).map((art) => ({
        ...art,
        id: art.id || art._id,
        created_at: art.createdAt || art.created_at,
      }));
    },

    getPublic: async () => {
      const res = await fetch(`${API_BASE}/artifacts/public`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch public artifacts');
      }
      return (result.artifacts || []).map((art) => ({
        ...art,
        id: art.id || art._id,
        created_at: art.createdAt || art.created_at,
      }));
    },

    getById: async (id) => {
      const res = await fetch(`${API_BASE}/artifacts/${id}`, {
        headers: getHeaders(true),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch artifact');
      }
      const art = result.artifact;
      return {
        ...art,
        id: art.id || art._id,
        created_at: art.createdAt || art.created_at,
      };
    },

    upload: async (formData) => {
      const res = await fetch(`${API_BASE}/artifacts`, {
        method: 'POST',
        headers: getHeaders(false),
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to upload artifact');
      }
      const art = result.artifact;
      return {
        ...art,
        id: art.id || art._id,
        created_at: art.createdAt || art.created_at,
      };
    },

    classify: async (id) => {
      const res = await fetch(`${API_BASE}/artifacts/${id}/classify`, {
        method: 'POST',
        headers: getHeaders(true),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Classification request failed');
      }
      return result;
    },

    delete: async (id) => {
      const res = await fetch(`${API_BASE}/artifacts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete artifact');
      }
      return result;
    },

    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/artifacts/${id}`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to update artifact');
      }
      return result.artifact;
    },

    getSimilar: async (id) => {
      const res = await fetch(`${API_BASE}/artifacts/${id}/similar`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch similar artifacts');
      }
      return result.similar || [];
    },
  },
};
