import axios from 'axios';

// Good: Centralized Axios instance with JWT interceptor and error normalization
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentInstanceId = 'unknown';

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('elearning_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const instanceHeader = response.headers['x-instance-id'];
    if (instanceHeader) {
      currentInstanceId = instanceHeader;
    }
    return response;
  },
  (error) => {
    if (error.response?.headers?.['x-instance-id']) {
      currentInstanceId = error.response.headers['x-instance-id'];
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('elearning_token');
      localStorage.removeItem('elearning_user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const getInstanceId = () => currentInstanceId;

// Authentication Services
export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data?.data || res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data?.data || res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/users/me');
    return res.data?.data || res.data;
  },
};

// Admin User Management Services
export const userApi = {
  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data?.data || res.data;
  },
};

// Category Services
export const categoryApi = {
  getAll: async () => {
    const res = await api.get('/categories');
    return res.data?.data || res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/categories/${id}`);
    return res.data?.data || res.data;
  },
  create: async (data) => {
    const res = await api.post('/categories', data);
    return res.data?.data || res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data?.data || res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data?.data || res.data;
  },
};

// Book Services
export const bookApi = {
  getAll: async (categoryId = null) => {
    const url = categoryId ? `/books?categoryId=${categoryId}` : '/books';
    const res = await api.get(url);
    return res.data?.data || res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/books/${id}`);
    return res.data?.data || res.data;
  },
  create: async (data) => {
    const res = await api.post('/books', data);
    return res.data?.data || res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/books/${id}`, data);
    return res.data?.data || res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/books/${id}`);
    return res.data?.data || res.data;
  },
  uploadFile: async (id, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/books/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return res.data?.data || res.data;
  },
  getDownloadUrl: async (id) => {
    const res = await api.get(`/books/${id}/download-url`);
    return res.data?.data || res.data;
  },
  search: async (query) => {
    const res = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
    return res.data?.data || res.data;
  },
};

// Video Services
export const videoApi = {
  getAll: async (categoryId = null) => {
    const url = categoryId ? `/videos?categoryId=${categoryId}` : '/videos';
    const res = await api.get(url);
    return res.data?.data || res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/videos/${id}`);
    return res.data?.data || res.data;
  },
  create: async (data) => {
    const res = await api.post('/videos', data);
    return res.data?.data || res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/videos/${id}`, data);
    return res.data?.data || res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/videos/${id}`);
    return res.data?.data || res.data;
  },
  uploadFile: async (id, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/videos/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return res.data?.data || res.data;
  },
  getStreamUrl: async (id) => {
    const res = await api.get(`/videos/${id}/stream-url`);
    return res.data?.data || res.data;
  },
  search: async (query) => {
    const res = await api.get(`/videos/search?q=${encodeURIComponent(query)}`);
    return res.data?.data || res.data;
  },
};

// Feedback Services
export const feedbackApi = {
  getAll: async () => {
    const res = await api.get('/feedbacks/admin');
    const data = res.data?.data || res.data;
    return data?.content || data;
  },
  create: async (data) => {
    const res = await api.post('/feedbacks', data);
    return res.data?.data || res.data;
  },
};

// Health Service
export const healthApi = {
  check: async () => {
    const res = await api.get('/health');
    return res.data?.data || res.data;
  },
};

export default api;
