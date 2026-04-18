import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth and Tenant IDs
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('school_token');
    const tenantId = localStorage.getItem('schoolsaas_tenant_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }
  }
  return config;
});

// Response interceptor for clean data access and error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API Error';
    // You can add global toast here if needed
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
