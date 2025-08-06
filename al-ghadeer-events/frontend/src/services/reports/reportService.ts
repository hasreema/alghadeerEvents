import api from '../api';

export interface MonthlyReportRequest {
  month: number;
  year: number;
  include_sections?: {
    events: boolean;
    payments: boolean;
    expenses: boolean;
    employees: boolean;
    profitability: boolean;
    charts: boolean;
  };
  language?: 'en' | 'he' | 'ar';
  send_email?: boolean;
  email_recipients?: string[];
}

export interface EventReportRequest {
  event_id: string;
  include_sections?: {
    details: boolean;
    payments: boolean;
    expenses: boolean;
    employees: boolean;
    tasks: boolean;
    photos: boolean;
  };
  language?: 'en' | 'he' | 'ar';
}

export interface ReportResponse {
  id: string;
  type: 'monthly' | 'event' | 'financial' | 'custom';
  status: 'generating' | 'completed' | 'failed';
  download_url?: string;
  created_at: string;
  file_size?: number;
  pages?: number;
}

export interface DashboardData {
  events_summary: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  financial_summary: {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    pending_payments: number;
  };
  monthly_trends: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    events: number;
  }[];
  upcoming_events: {
    id: string;
    name: string;
    date: string;
    status: string;
    payment_status: string;
  }[];
  recent_payments: {
    id: string;
    event_name: string;
    amount: number;
    date: string;
    method: string;
  }[];
  profit_meter: {
    status: 'excellent' | 'good' | 'warning' | 'poor';
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface ProfitabilityReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_expenses: number;
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
  by_event_type: {
    type: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    count: number;
  }[];
  by_location: {
    location: string;
    revenue: number;
    expenses: number;
    profit: number;
    events: number;
  }[];
  top_profitable_events: {
    id: string;
    name: string;
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  }[];
  expense_breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

class ReportService {
  // Monthly reports
  async generateMonthlyReport(request: MonthlyReportRequest): Promise<ReportResponse> {
    const response = await api.post<ReportResponse>('/reports/monthly', request);
    return response.data;
  }

  async scheduleMonthlyReport(config: {
    day_of_month: number;
    time: string;
    email_recipients: string[];
    include_sections: MonthlyReportRequest['include_sections'];
    language: string;
  }): Promise<{ id: string; active: boolean }> {
    const response = await api.post<{ id: string; active: boolean }>('/reports/monthly/schedule', config);
    return response.data;
  }

  // Event reports
  async generateEventReport(request: EventReportRequest): Promise<ReportResponse> {
    const response = await api.post<ReportResponse>('/reports/event', request);
    return response.data;
  }

  // Financial reports
  async generateFinancialReport(params: {
    start_date: string;
    end_date: string;
    group_by?: 'day' | 'week' | 'month';
    include_charts?: boolean;
  }): Promise<ReportResponse> {
    const response = await api.post<ReportResponse>('/reports/financial', params);
    return response.data;
  }

  // Dashboard data
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/reports/dashboard');
    return response.data;
  }

  // Profitability analysis
  async getProfitabilityReport(params?: {
    start_date?: string;
    end_date?: string;
    event_type?: string;
    location?: string;
  }): Promise<ProfitabilityReport> {
    const response = await api.get<ProfitabilityReport>('/reports/profitability', { params });
    return response.data;
  }

  // Report history
  async getReportHistory(params?: {
    type?: string;
    limit?: number;
  }): Promise<ReportResponse[]> {
    const response = await api.get<ReportResponse[]>('/reports/history', { params });
    return response.data;
  }

  // Download report
  async downloadReport(reportId: string): Promise<Blob> {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Custom reports
  async generateCustomReport(config: {
    name: string;
    filters: any;
    columns: string[];
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<ReportResponse> {
    const response = await api.post<ReportResponse>('/reports/custom', config);
    return response.data;
  }

  // Report templates
  async getReportTemplates(): Promise<{
    id: string;
    name: string;
    type: string;
    description: string;
    config: any;
  }[]> {
    const response = await api.get<any[]>('/reports/templates');
    return response.data;
  }

  async saveReportTemplate(template: {
    name: string;
    type: string;
    description: string;
    config: any;
  }): Promise<{ id: string }> {
    const response = await api.post<{ id: string }>('/reports/templates', template);
    return response.data;
  }
}

export default new ReportService();