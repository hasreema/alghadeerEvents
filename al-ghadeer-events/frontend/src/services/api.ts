import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get the auth token from session
    const session = await getSession();
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        const session = await getSession();
        if (session?.refreshToken) {
          // TODO: Implement token refresh logic
          // const newToken = await refreshAccessToken(session.refreshToken);
          // if (newToken) {
          //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
          //   return api(originalRequest);
          // }
        }
      } catch (refreshError) {
        // Refresh failed, sign out user
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    }
    
    // Handle other errors
    const errorMessage = (error.response?.data as any)?.detail || 
                        error.message || 
                        'An unexpected error occurred';
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

// Helper function for handling API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Generic API response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// Export configured axios instance
export default api;