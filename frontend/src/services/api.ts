import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
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
      // Handle unauthorized (e.g., redirect to login)
      localStorage.removeItem('access_token'); localStorage.removeItem('rv_token'); localStorage.removeItem('rv_user');
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
