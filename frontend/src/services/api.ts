import axios from 'axios';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Default to relative /api/v1 for production Vercel rewrite & Vite dev proxy
  return '/api/v1';
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanEndpoint.startsWith('/api/v1')) {
    if (baseUrl.endsWith('/api/v1')) {
      return `${baseUrl}${cleanEndpoint.substring(7)}`;
    }
  }

  return `${baseUrl}${cleanEndpoint}`;
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rv_token') || localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('rv_token');
      localStorage.removeItem('rv_user');
    }
    return Promise.reject(error);
  }
);

export const getVerificationAIResults = async (verificationId: string) => {
  const response = await api.get(`/verifications/${verificationId}/ai-results`);
  return response.data;
};

export const getAdminAIMonitoring = async () => {
  const response = await api.get('/admin/ai/monitoring');
  return response.data;
};

export const triggerAIRetrain = async () => {
  const response = await api.post('/admin/ai/retrain');
  return response.data;
};

export const analyzeTransaction = async (payload: any) => {
  const response = await api.post('/ai/analyze-transaction', payload);
  return response.data;
};
