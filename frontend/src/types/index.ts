// User and Authentication Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  settings: UserSettings;
  created_at: string;
  last_login?: string;
}

export interface UserSettings {
  language: 'en' | 'ar' | 'he';
  timezone: string;
  notifications_email: boolean;
  notifications_whatsapp: boolean;
  theme: 'light' | 'dark';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  event_type: 'wedding' | 'henna' | 'engagement' | 'graduation' | 'birthday' | 'corporate' | 'other';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  contact: ContactInfo;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: 'hall_a' | 'hall_b' | 'garden' | 'rooftop';
  guest_count: number;
  base_price: number;
  service_addons: ServiceAddon[];
  total_price: number;
  amount_paid: number;
  payment_status: 'not_paid' | 'partially_paid' | 'paid' | 'overdue';
  assigned_employees: string[];
  labor_cost: number;
  notes?: string;
  special_requirements: string[];
  equipment_needed: string[];
  profit_margin?: number;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  client_name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface ServiceAddon {
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface CreateEventData {
  title: string;
  event_type: Event['event_type'];
  contact: ContactInfo;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: Event['venue'];
  guest_count: number;
  base_price: number;
  service_addons: ServiceAddon[];
  notes?: string;
  special_requirements: string[];
  equipment_needed: string[];
}

// Payment Types
export interface Payment {
  id: string;
  event_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  payment_type: 'deposit' | 'partial' | 'final' | 'refund';
  payment_date: string;
  reference_number?: string;
  receipt_number?: string;
  receipt?: Receipt;
  bank_name?: string;
  account_number?: string;
  transaction_id?: string;
  notes?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  filename: string;
  file_url: string;
  file_type: 'image' | 'pdf' | 'scan';
  file_size?: number;
  upload_date: string;
}

// Employee Types
export interface Employee {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  employee_id?: string;
  role: 'manager' | 'waiter' | 'chef' | 'cleaner' | 'security' | 'dj' | 'decorator' | 'photographer' | 'coordinator';
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hire_date: string;
  hourly_rate: number;
  overtime_rate?: number;
  total_hours_worked: number;
  total_earnings: number;
  pending_payments: number;
  skills: string[];
  certifications: string[];
  languages: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'setup' | 'cleanup' | 'decoration' | 'equipment' | 'catering' | 'security' | 'coordination' | 'maintenance' | 'administrative' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_by?: string;
  event_id?: string;
  due_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  completed_at?: string;
  completed_by?: string;
  completion_notes?: string;
  depends_on: string[];
  blocked_by: string[];
  attachments: string[];
  notes?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  next_occurrence?: string;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
}

// Dashboard and Analytics Types
export interface DashboardData {
  summary: {
    total_events: number;
    total_revenue: number;
    active_employees: number;
    pending_tasks: number;
  };
  recent_events: Array<{
    id: string;
    title: string;
    event_date: string;
    status: string;
  }>;
  recent_payments: Array<{
    id: string;
    amount: number;
    payment_date: string;
    event_id: string;
  }>;
}

export interface EventStats {
  total_events: number;
  confirmed_events: number;
  completed_events: number;
  total_revenue: number;
  total_profit: number;
  upcoming_events: number;
  overdue_payments: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form Types
export interface FilterOptions {
  status?: string;
  event_type?: string;
  venue?: string;
  start_date?: string;
  end_date?: string;
  payment_status?: string;
}

// Language and Localization
export interface TranslationKey {
  en: string;
  ar: string;
  he: string;
}

export type Language = 'en' | 'ar' | 'he';

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

// Calendar Event Type
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}