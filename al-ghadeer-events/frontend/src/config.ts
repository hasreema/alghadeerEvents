export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Al Ghadeer Events';
export const DEFAULT_LANGUAGE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

export const FEATURE_FLAGS = {
  enableGoogleCalendar: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR === 'true',
  enableWhatsappShare: process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_SHARE === 'true',
  enablePdfExport: process.env.NEXT_PUBLIC_ENABLE_PDF_EXPORT === 'true',
  enableExcelExport: process.env.NEXT_PUBLIC_ENABLE_EXCEL_EXPORT === 'true',
};