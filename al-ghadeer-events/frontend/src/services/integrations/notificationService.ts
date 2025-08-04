import api from '../api';

export interface EmailNotification {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  html_body?: string;
  attachments?: {
    filename: string;
    content: string;
    content_type: string;
  }[];
  template_id?: string;
  template_data?: Record<string, any>;
}

export interface WhatsAppNotification {
  to: string;
  message: string;
  template_name?: string;
  template_params?: string[];
  media_url?: string;
  media_type?: 'image' | 'document' | 'audio' | 'video';
}

export interface NotificationResponse {
  id: string;
  status: 'sent' | 'failed' | 'pending';
  message: string;
  sent_at?: string;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  html_body?: string;
  variables: string[];
  category: 'event' | 'payment' | 'reminder' | 'report' | 'general';
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  params: string[];
  status: 'approved' | 'pending' | 'rejected';
  language: string;
}

class NotificationService {
  // Email notifications
  async sendEmail(notification: EmailNotification): Promise<NotificationResponse> {
    const response = await api.post<NotificationResponse>('/notifications/email', notification);
    return response.data;
  }

  async sendBulkEmails(notifications: EmailNotification[]): Promise<NotificationResponse[]> {
    const response = await api.post<NotificationResponse[]>('/notifications/email/bulk', {
      notifications,
    });
    return response.data;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await api.get<EmailTemplate[]>('/notifications/email/templates');
    return response.data;
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const response = await api.post<EmailTemplate>('/notifications/email/templates', template);
    return response.data;
  }

  async updateEmailTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await api.put<EmailTemplate>(`/notifications/email/templates/${id}`, template);
    return response.data;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await api.delete(`/notifications/email/templates/${id}`);
  }

  // WhatsApp notifications
  async sendWhatsApp(notification: WhatsAppNotification): Promise<NotificationResponse> {
    const response = await api.post<NotificationResponse>('/notifications/whatsapp', notification);
    return response.data;
  }

  async sendBulkWhatsApp(notifications: WhatsAppNotification[]): Promise<NotificationResponse[]> {
    const response = await api.post<NotificationResponse[]>('/notifications/whatsapp/bulk', {
      notifications,
    });
    return response.data;
  }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    const response = await api.get<WhatsAppTemplate[]>('/notifications/whatsapp/templates');
    return response.data;
  }

  async createWhatsAppTemplate(template: Omit<WhatsAppTemplate, 'id'>): Promise<WhatsAppTemplate> {
    const response = await api.post<WhatsAppTemplate>('/notifications/whatsapp/templates', template);
    return response.data;
  }

  // Notification history
  async getNotificationHistory(params?: {
    type?: 'email' | 'whatsapp';
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<NotificationResponse[]> {
    const response = await api.get<NotificationResponse[]>('/notifications/history', { params });
    return response.data;
  }

  // Automated notifications
  async sendEventReminder(eventId: string, type: 'email' | 'whatsapp' | 'both'): Promise<NotificationResponse[]> {
    const response = await api.post<NotificationResponse[]>(`/notifications/events/${eventId}/reminder`, {
      type,
    });
    return response.data;
  }

  async sendPaymentReminder(eventId: string, type: 'email' | 'whatsapp' | 'both'): Promise<NotificationResponse[]> {
    const response = await api.post<NotificationResponse[]>(`/notifications/events/${eventId}/payment-reminder`, {
      type,
    });
    return response.data;
  }

  async sendEventConfirmation(eventId: string, type: 'email' | 'whatsapp' | 'both'): Promise<NotificationResponse[]> {
    const response = await api.post<NotificationResponse[]>(`/notifications/events/${eventId}/confirmation`, {
      type,
    });
    return response.data;
  }

  // Test notifications
  async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/notifications/email/test');
    return response.data;
  }

  async testWhatsAppConnection(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/notifications/whatsapp/test');
    return response.data;
  }
}

export default new NotificationService();