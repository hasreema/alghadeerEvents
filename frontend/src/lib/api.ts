import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('auth_token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
  
  refreshToken: () =>
    api.post('/api/auth/refresh'),
  
  logout: () => {
    Cookies.remove('auth_token');
    window.location.href = '/login';
  },
};

export const eventsAPI = {
  getAll: (params?: any) =>
    api.get('/api/events', { params }),
  
  getById: (id: string) =>
    api.get(`/api/events/${id}`),
  
  create: (data: any) =>
    api.post('/api/events', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/events/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/events/${id}`),
  
  getStats: () =>
    api.get('/api/events/stats/overview'),
  
  getUpcoming: (limit?: number) =>
    api.get('/api/events/upcoming/next', { params: { limit } }),
  
  assignEmployee: (eventId: string, employeeId: string) =>
    api.post(`/api/events/${eventId}/assign-employee`, { employee_id: employeeId }),
  
  removeEmployee: (eventId: string, employeeId: string) =>
    api.delete(`/api/events/${eventId}/remove-employee/${employeeId}`),
};

export const paymentsAPI = {
  getAll: (params?: any) =>
    api.get('/api/payments', { params }),
  
  getById: (id: string) =>
    api.get(`/api/payments/${id}`),
  
  create: (data: any) =>
    api.post('/api/payments', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/payments/${id}`, data),
  
  verify: (id: string) =>
    api.post(`/api/payments/${id}/verify`),
  
  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/payments/${id}/upload-receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getStats: () =>
    api.get('/api/payments/stats/overview'),
};

export const employeesAPI = {
  getAll: (params?: any) =>
    api.get('/api/employees', { params }),
  
  getById: (id: string) =>
    api.get(`/api/employees/${id}`),
  
  create: (data: any) =>
    api.post('/api/employees', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/employees/${id}`, data),
  
  addWorkShift: (id: string, data: any) =>
    api.post(`/api/employees/${id}/work-shift`, data),
  
  getStats: () =>
    api.get('/api/employees/stats/overview'),
};

export const tasksAPI = {
  getAll: (params?: any) =>
    api.get('/api/tasks', { params }),
  
  getById: (id: string) =>
    api.get(`/api/tasks/${id}`),
  
  create: (data: any) =>
    api.post('/api/tasks', data),
  
  update: (id: string, data: any) =>
    api.put(`/api/tasks/${id}`, data),
  
  complete: (id: string, data?: any) =>
    api.post(`/api/tasks/${id}/complete`, data),
  
  getStats: () =>
    api.get('/api/tasks/stats/overview'),
};

export const reportsAPI = {
  getDashboard: () =>
    api.get('/api/reports/dashboard'),
  
  getProfitability: (params?: any) =>
    api.get('/api/reports/profitability', { params }),
  
  generateMonthly: (year: number, month: number) =>
    api.post('/api/reports/monthly', null, { params: { year, month } }),
  
  sendMonthly: (year: number, month: number, email?: string) =>
    api.post('/api/reports/send-monthly', null, { params: { year, month, email } }),
  
  exportEvents: (params?: any) =>
    api.get('/api/reports/export/events', { params }),
  
  exportPayments: (params?: any) =>
    api.get('/api/reports/export/payments', { params }),
};

export const notificationsAPI = {
  sendEmail: (data: any) =>
    api.post('/api/notifications/email', data),
  
  sendWhatsApp: (data: any) =>
    api.post('/api/notifications/whatsapp', data),
  
  sendPush: (data: any) =>
    api.post('/api/notifications/push', data),
  
  sendPaymentReminder: (eventId: string) =>
    api.post(`/api/notifications/payment-reminder/${eventId}`),
  
  notifyTeam: (eventId: string, message: string) =>
    api.post(`/api/notifications/event/${eventId}/notify-team`, { message }),
  
  getTemplates: () =>
    api.get('/api/notifications/templates'),
};

export const googleSheetsAPI = {
  syncAll: () =>
    api.post('/api/google-sheets/sync/all'),
  
  syncEvents: () =>
    api.post('/api/google-sheets/sync/events'),
  
  syncPayments: () =>
    api.post('/api/google-sheets/sync/payments'),
  
  syncEmployees: () =>
    api.post('/api/google-sheets/sync/employees'),
  
  syncTasks: () =>
    api.post('/api/google-sheets/sync/tasks'),
  
  getStatus: () =>
    api.get('/api/google-sheets/status'),
  
  setup: (spreadsheetId: string) =>
    api.post('/api/google-sheets/setup', { spreadsheet_id: spreadsheetId }),
  
  getExportFormat: () =>
    api.get('/api/google-sheets/export-format'),
};

export default api;