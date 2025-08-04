# 🏋️ Al Ghadeer Events Management System

A comprehensive internal event management system for hall owners to manage all aspects of events including event details, payments, employees, requests, expenses, profitability, reminders, and automatic reporting.

## 🎯 Overview

This system is designed specifically for hall owners (not customers) to manage:

- ✅ **Events Management** – Full lifecycle from booking to post-event
- 💵 **Financial Tracking** – Payments, expenses, profit/loss
- 👥 **Employee Management** – Assignments, labor costs, payments
- 📊 **Automated Reporting** – Monthly PDF summaries (Hebrew/English/Arabic)
- 🌐 **Multi-language Support** – English, Hebrew, Arabic
- 📱 **Mobile-First Design** – Responsive web app
- 🔄 **Integration** – Google Sheets, Gmail, WhatsApp, Zapier
- 📆 **Calendar View + Drag & Drop** – Visual scheduling
- 🔔 **Google Calendar Sync & ICS Export**
- ⚠️ **Visual Alerts for Incomplete Events**
- 📧 **Monthly Reports by Email**
- 📤 **Excel/CSV Export**
- 📲 **Push Notifications**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- MongoDB 4.4+
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd al-ghadeer-events
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   mongod --dbpath /path/to/data
   ```

5. **Run with Docker** (recommended)
   ```bash
   docker-compose up -d
   ```

### Running the Application

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

## 📂 Project Structure

```
al-ghadeer-events/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Core configuration
│   │   ├── models/            # MongoDB models
│   │   ├── services/          # Business logic
│   │   └── integrations/      # External services
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js TypeScript frontend
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── store/           # Zustand state management
│   │   └── hooks/           # Custom React hooks
│   ├── package.json
│   └── Dockerfile
├── docs/                      # Documentation
├── automation/                # Zapier workflows
└── docker-compose.yml
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=al_ghadeer_events

# JWT
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Admin User
ADMIN_EMAIL=admin@alghadeer.com
ADMIN_PASSWORD=changeme

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS=path/to/credentials.json
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# WhatsApp Business
WHATSAPP_API_KEY=your-api-key
WHATSAPP_PHONE_NUMBER=+1234567890

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=5242880  # 5MB

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 📋 Features

### Event Management
- Create, update, and delete events
- Event status tracking (pending, confirmed, in-progress, completed, cancelled)
- Customer information management
- Pricing and payment tracking
- Special requests and notes
- Menu and decoration details
- Contact management

### Financial Management
- Payment recording with receipt uploads
- Expense tracking
- Profitability analysis
- Payment status monitoring
- Multiple payment methods support

### Employee Management
- Staff assignment to events
- Wage tracking
- Role-based assignments
- Performance tracking

### Calendar Features
- Drag & drop event rescheduling
- Multiple calendar views (month, week, day)
- Color-coded event status
- Real-time updates
- Google Calendar sync

### Reporting
- Monthly PDF reports in Hebrew/English/Arabic
- Event-specific reports
- Financial analysis
- Custom report generation
- Automated email delivery

### Integrations
- **Google Sheets**: Bi-directional sync
- **Email**: SMTP integration for notifications
- **WhatsApp**: Business API for alerts
- **Zapier**: Workflow automation
- **Google Drive**: Receipt storage

## 🔐 Security

- JWT-based authentication
- Role-based access control (Admin, Staff)
- Secure file upload validation
- HTTPS enforcement
- Environment-based secrets management
- MongoDB connection encryption

## 📱 Mobile Support

The system is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

Progressive Web App (PWA) support for offline functionality (coming soon).

## 🌐 API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📤 Deployment

### Production Deployment

1. **Backend**: Deploy to Railway, Render, or Google Cloud Run
2. **Frontend**: Deploy to Vercel or Netlify
3. **Database**: Use MongoDB Atlas
4. **File Storage**: Google Cloud Storage or AWS S3

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Al Ghadeer Events.

## 👥 Team

- **Backend Development**: Python/FastAPI
- **Frontend Development**: React/Next.js
- **UI/UX Design**: Material-UI/Tailwind CSS
- **Database**: MongoDB

## 📞 Support

For support, email support@alghadeer.com or join our Slack channel.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added Google Sheets integration
- **v1.2.0** - WhatsApp notifications
- **v1.3.0** - Calendar drag & drop
- **v1.4.0** - PDF report generation

## 🚧 Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered event suggestions
- [ ] Customer portal
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Inventory management
- [ ] Vendor management
- [ ] Contract generation

---

Built with ❤️ for Al Ghadeer Events