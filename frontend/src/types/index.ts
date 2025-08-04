// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  is_verified: boolean;
  phone_number?: string;
  preferred_language: 'en' | 'he' | 'ar';
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
  avatar_url?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

// Event Types
export type EventType = 'wedding' | 'henna' | 'engagement' | 'graduation' | 'birthday' | 'other';
export type EventLocation = 'hall_floor_0' | 'hall_floor_1' | 'garden' | 'waterfall';
export type EventStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type Gender = 'male' | 'female' | 'mixed';

export interface EventPricing {
  base_price: number;
  additional_services: Record<string, number>;
  discounts: number;
  taxes: number;
  total_price: number;
}

export interface EventContact {
  name: string;
  phone: string;
  email?: string;
  relation?: string;
  is_primary: boolean;
}

export interface Event {
  id: string;
  event_name: string;
  event_type: EventType;
  event_type_other?: string;
  location: EventLocation;
  status: EventStatus;
  event_date: string;
  start_time: string;
  end_time: string;
  setup_time?: string;
  cleanup_time?: string;
  expected_guests: number;
  actual_guests?: number;
  guest_gender: Gender;
  contacts: EventContact[];
  services: Record<string, boolean>;
  special_requests?: string;
  decoration_type: string;
  decoration_details?: string;
  menu_selections: Record<string, string[]>;
  dietary_restrictions: string[];
  pricing: EventPricing;
  payment_status: PaymentStatus;
  deposit_amount: number;
  deposit_paid: boolean;
  outstanding_balance: number;
  assigned_employees: string[];
  labor_cost: number;
  total_revenue: number;
  total_expenses: number;
  profit: number;
  profit_margin: number;
  internal_notes?: string;
  contract_url?: string;
  created_at: string;
  updated_at: string;
}

// Payment Types
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'overdue';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';

export interface Payment {
  id: string;
  event_id: string;
  event_name: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  payment_status: PaymentStatus;
  transaction_id?: string;
  reference_number?: string;
  receipt_url?: string;
  receipt_number?: string;
  payer_name: string;
  payer_phone?: string;
  payer_email?: string;
  description?: string;
  notes?: string;
  is_refunded: boolean;
  refund_amount?: number;
  refund_date?: string;
  refund_reason?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Employee Types
export interface EmployeeSchedule {
  event_id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  hourly_rate: number;
  total_payment: number;
  is_paid: boolean;
  paid_date?: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email?: string;
  phone_number: string;
  address?: string;
  position: string;
  department?: string;
  hire_date: string;
  is_active: boolean;
  hourly_rate: number;
  monthly_salary?: number;
  payment_method: string;
  bank_account?: string;
  default_availability: Record<string, string[]>;
  assigned_events: EmployeeSchedule[];
  total_events_worked: number;
  rating?: number;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  id_number?: string;
  documents: string[];
  created_at: string;
  updated_at: string;
}

// Task Types
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskComment {
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_by?: string;
  assigned_by_name?: string;
  event_id?: string;
  event_name?: string;
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  checklist: Array<{ item: string; completed: boolean }>;
  progress_percentage: number;
  comments: TaskComment[];
  tags: string[];
  category?: string;
  reminder_enabled: boolean;
  reminder_before_hours: number;
  reminder_sent: boolean;
  depends_on: string[];
  blocks: string[];
  attachments: string[];
  created_at: string;
  updated_at: string;
}

// Common Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}