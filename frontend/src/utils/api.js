import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⭐ Attach Firebase ID Token automatically
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error("Failed to get Firebase token", err);
    }
  }

  return config;
});


/**
 * Upload text content
 */
export const uploadText = async (text, options = {}) => {
  const formData = new FormData();
  formData.append('text', text);
  
  if (options.expiryMinutes) {
    formData.append('expiryMinutes', options.expiryMinutes);
  }
  
  if (options.password) {
    formData.append('password', options.password);
  }
  
  if (options.maxViews) {
    formData.append('maxViews', options.maxViews);
  }
  
  if (options.oneTimeView) {
    formData.append('oneTimeView', 'true');
  }

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Upload file
 */
export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.expiryMinutes) {
    formData.append('expiryMinutes', options.expiryMinutes);
  }
  
  if (options.password) {
    formData.append('password', options.password);
  }
  
  if (options.maxViews) {
    formData.append('maxViews', options.maxViews);
  }
  
  if (options.oneTimeView) {
    formData.append('oneTimeView', 'true');
  }

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Get content by ID
 */
export const getContent = async (id, password = null) => {
  const params = password ? { password } : {};
  const response = await api.get(`/content/${id}`, { params });
  return response.data;
};

/**
 * Download file
 */
export const downloadFile = (id, password = null) => {
  const params = password ? `?password=${encodeURIComponent(password)}` : '';
  return `${API_BASE_URL}/download/${id}${params}`;
};

/**
 * Delete content
 */
export const deleteContent = async (id, password = null) => {
  const response = await api.delete(`/content/${id}`, {
    data: { password },
  });
  return response.data;
};

/**
 * Get server stats
 */
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;