import api from '../api';

export interface GoogleSheetsConfig {
  spreadsheet_id: string;
  credentials_json?: string;
  sheet_names: {
    events: string;
    payments: string;
    employees: string;
    expenses: string;
  };
}

export interface SyncStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
  last_sync: string;
  records_synced: number;
  errors?: string[];
}

class GoogleSheetsService {
  async getConfig(): Promise<GoogleSheetsConfig> {
    const response = await api.get<GoogleSheetsConfig>('/google-sheets/config');
    return response.data;
  }

  async updateConfig(config: Partial<GoogleSheetsConfig>): Promise<GoogleSheetsConfig> {
    const response = await api.put<GoogleSheetsConfig>('/google-sheets/config', config);
    return response.data;
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const response = await api.post<{ connected: boolean; message: string }>('/google-sheets/test');
    return response.data;
  }

  async syncAll(): Promise<SyncStatus> {
    const response = await api.post<SyncStatus>('/google-sheets/sync/all');
    return response.data;
  }

  async syncEvents(): Promise<SyncStatus> {
    const response = await api.post<SyncStatus>('/google-sheets/sync/events');
    return response.data;
  }

  async syncPayments(): Promise<SyncStatus> {
    const response = await api.post<SyncStatus>('/google-sheets/sync/payments');
    return response.data;
  }

  async syncEmployees(): Promise<SyncStatus> {
    const response = await api.post<SyncStatus>('/google-sheets/sync/employees');
    return response.data;
  }

  async syncExpenses(): Promise<SyncStatus> {
    const response = await api.post<SyncStatus>('/google-sheets/sync/expenses');
    return response.data;
  }

  async getSyncHistory(limit: number = 10): Promise<SyncStatus[]> {
    const response = await api.get<SyncStatus[]>('/google-sheets/sync/history', {
      params: { limit },
    });
    return response.data;
  }

  async setupWebhook(url: string): Promise<{ webhook_url: string; active: boolean }> {
    const response = await api.post<{ webhook_url: string; active: boolean }>(
      '/google-sheets/webhook',
      { url }
    );
    return response.data;
  }

  async exportToSheets(data: {
    type: 'events' | 'payments' | 'employees' | 'expenses';
    filters?: any;
  }): Promise<{ spreadsheet_url: string }> {
    const response = await api.post<{ spreadsheet_url: string }>(
      '/google-sheets/export',
      data
    );
    return response.data;
  }
}

export default new GoogleSheetsService();