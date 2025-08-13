import api, { setTokens, clearTokens } from '../api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  phone_number?: string;
  preferred_language?: string;
  department?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    preferred_language: string;
    avatar_url?: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  preferred_language: string;
  phone_number?: string;
  department?: string;
  avatar_url?: string;
  email_notifications?: boolean;
  whatsapp_notifications?: boolean;
  push_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { access_token, refresh_token, user } = response.data;
    setTokens(access_token, refresh_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (_) {
    } finally {
      clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }
}

export default new AuthService();