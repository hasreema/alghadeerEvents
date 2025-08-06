import api from '../api';

export interface Payment {
  id: string;
  event_id: string;
  amount: number;
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  payment_date: string;
  receipt_number?: string;
  receipt_url?: string;
  receipt_file_name?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  event_id: string;
  amount: number;
  payment_method: Payment['payment_method'];
  payment_date: string;
  receipt_number?: string;
  notes?: string;
  receipt_file?: File;
}

export interface UpdatePaymentRequest {
  amount?: number;
  payment_method?: Payment['payment_method'];
  payment_date?: string;
  receipt_number?: string;
  notes?: string;
  status?: Payment['status'];
  receipt_file?: File;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  event_id?: string;
  payment_method?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  pending_amount: number;
  completed_amount: number;
  payment_methods: {
    method: string;
    count: number;
    amount: number;
  }[];
  monthly_payments: {
    month: string;
    count: number;
    amount: number;
  }[];
}

class PaymentService {
  async getPayments(params?: PaymentListParams): Promise<PaymentListResponse> {
    const response = await api.get<PaymentListResponse>('/payments', { params });
    return response.data;
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  }

  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const formData = new FormData();
    
    // Add payment data
    formData.append('event_id', data.event_id);
    formData.append('amount', data.amount.toString());
    formData.append('payment_method', data.payment_method);
    formData.append('payment_date', data.payment_date);
    
    if (data.receipt_number) {
      formData.append('receipt_number', data.receipt_number);
    }
    
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // Add receipt file if provided
    if (data.receipt_file) {
      formData.append('receipt_file', data.receipt_file);
    }
    
    const response = await api.post<Payment>('/payments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async updatePayment(id: string, data: UpdatePaymentRequest): Promise<Payment> {
    const formData = new FormData();
    
    // Add updated fields
    if (data.amount !== undefined) {
      formData.append('amount', data.amount.toString());
    }
    
    if (data.payment_method) {
      formData.append('payment_method', data.payment_method);
    }
    
    if (data.payment_date) {
      formData.append('payment_date', data.payment_date);
    }
    
    if (data.receipt_number) {
      formData.append('receipt_number', data.receipt_number);
    }
    
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    if (data.status) {
      formData.append('status', data.status);
    }
    
    // Add receipt file if provided
    if (data.receipt_file) {
      formData.append('receipt_file', data.receipt_file);
    }
    
    const response = await api.put<Payment>(`/payments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async deletePayment(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  }

  async downloadReceipt(id: string): Promise<Blob> {
    const response = await api.get(`/payments/${id}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getPaymentSummary(eventId?: string): Promise<PaymentSummary> {
    const params = eventId ? { event_id: eventId } : {};
    const response = await api.get<PaymentSummary>('/payments/summary', { params });
    return response.data;
  }

  async exportPayments(params?: PaymentListParams): Promise<Blob> {
    const response = await api.get('/payments/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Helper function to validate file before upload
  validateReceiptFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be JPG, PNG, or PDF' };
    }
    
    return { valid: true };
  }

  // Helper to create preview URL for image receipts
  createReceiptPreview(file: File): string | null {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }
}

export default new PaymentService();