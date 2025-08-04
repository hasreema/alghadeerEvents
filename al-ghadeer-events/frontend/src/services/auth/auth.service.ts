import apiClient from '@/lib/api/client';
import { User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  password: string;
  phone_number?: string;
  preferred_language?: string;
  department?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store token
    localStorage.setItem('access_token', response.data.access_token);
    
    return response.data;
  }

  static async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/api/auth/register', data);
    return response.data;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/api/auth/me', data);
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  static async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  static async verifyToken(): Promise<User | null> {
    try {
      const response = await apiClient.post<User>('/api/auth/verify-token');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export default AuthService;