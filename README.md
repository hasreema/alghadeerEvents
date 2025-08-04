# 🏛️ Al Ghadeer Events Management System

A comprehensive, multi-language event management system designed specifically for hall owners and event managers. Built with modern technologies and optimized for the Middle East market with full Arabic and Hebrew support.

## 🌟 Features

### 📅 **Complete Event Management**
- Full event lifecycle management (booking to completion)
- Multi-venue support (Halls A/B, Garden, Rooftop)
- Dynamic pricing with service add-ons
- Real-time calendar view with drag & drop
- Guest capacity management
- Special requirements tracking

### 💰 **Financial Management**
- Payment tracking with receipt uploads
- Automatic profitability calculations
- Outstanding balance monitoring
- Multi-currency support (₪ Shekels)
- Financial reports and analytics
- Export to Excel/CSV

### 👥 **Staff Management**
- Employee profiles and assignments
- Role-based access control
- Wage calculations and tracking
- Work shift management
- Performance ratings
- Skills and certifications tracking

### 📋 **Task & Project Management**
- Event-specific and general tasks
- Priority-based task assignment
- Dependency tracking
- Recurring task support
- Progress monitoring
- Team collaboration tools

### 🔔 **Smart Notifications**
- WhatsApp Business integration
- Email notifications
- Push notifications
- Payment reminders
- Event alerts
- Custom notification templates

### 📊 **Reporting & Analytics**
- Automated monthly PDF reports (Hebrew)
- Real-time dashboard analytics
- Profitability analysis
- Performance metrics
- Visual charts and graphs
- Scheduled report delivery

### 🌍 **Multi-Language Support**
- **English** (Default)
- **Arabic** (RTL support)
- **Hebrew** (RTL support)
- Dynamic language switching
- Localized date/number formatting

### 🔄 **Integrations**
- Google Sheets synchronization
- Google Calendar sync
- WhatsApp Business API
- Gmail SMTP
- Zapier automation
- ICS calendar export

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Chakra UI
- **State Management**: React Query + Context
- **Styling**: Emotion + Custom CSS
- **Icons**: React Icons
- **Charts**: Recharts
- **Calendar**: React Big Calendar
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Beanie ODM
- **Authentication**: JWT with secure HTTP-only cookies
- **File Storage**: Local/Google Cloud Storage
- **PDF Generation**: ReportLab
- **Email**: Gmail SMTP
- **Validation**: Pydantic

### Mobile
- **Current**: Glide Apps (MVP)
- **Future**: React Native

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.9+ and pip
- **MongoDB** 4.4+
- **Google Account** (for APIs)
- **WhatsApp Business Account**

### 1. Clone Repository
```bash
git clone https://github.com/alghadeer-events/management-system.git
cd management-system
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📱 Mobile App (Glide)

The mobile MVP is built with Glide Apps for rapid deployment and easy updates.

### Features
- Dashboard overview
- Event management
- Payment tracking
- Task management
- Push notifications
- Offline support

### Setup
1. Import the provided Glide template
2. Connect to Google Sheets data source
3. Configure WhatsApp integration
4. Deploy to app stores

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=alghadeer_events

# Security
SECRET_KEY=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google APIs
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Email
GMAIL_USER=alghadeerevents@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# WhatsApp
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Al Ghadeer Events Management System
```

### Google Sheets Integration
1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account
4. Download credentials JSON
5. Share spreadsheet with service account email

### WhatsApp Business Setup
1. Create Facebook Business Account
2. Set up WhatsApp Business API
3. Get access token and phone number ID
4. Configure webhooks for notifications

---

## 📊 Database Schema

### Core Collections
- **Users** - Authentication and user management
- **Events** - Event details and scheduling
- **Payments** - Financial transactions
- **Employees** - Staff information and assignments
- **Tasks** - Task management and tracking
- **Reminders** - Notification and alert system

### Key Relationships
- Events ↔ Payments (one-to-many)
- Events ↔ Employees (many-to-many)
- Events ↔ Tasks (one-to-many)
- Users ↔ Tasks (assignment)

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info
- `POST /api/auth/refresh` - Refresh token

### Events
- `GET /api/events` - List events with filters
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `GET /api/events/stats/overview` - Event statistics

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `POST /api/payments/{id}/verify` - Verify payment
- `POST /api/payments/{id}/upload-receipt` - Upload receipt

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Add employee
- `POST /api/employees/{id}/work-shift` - Log work shift

### Reports
- `GET /api/reports/dashboard` - Dashboard data
- `POST /api/reports/monthly` - Generate monthly report
- `GET /api/reports/profitability` - Profit analysis

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

### E2E Testing
```bash
npm run test:e2e
```

---

## 🚀 Deployment

### Backend (Railway/Render)
```bash
# Build and deploy
docker build -t alghadeer-backend .
# Deploy to your preferred platform
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy to Vercel or Netlify
```

### Environment Setup
1. Set up production databases
2. Configure environment variables
3. Set up domain and SSL
4. Configure monitoring and logging

---

## 📈 Performance

### Optimization Features
- Server-side rendering (SSR)
- Static site generation (SSG)
- Image optimization
- Code splitting
- Caching strategies
- Database indexing
- API rate limiting

### Monitoring
- Application performance monitoring
- Error tracking
- User analytics
- Database performance
- API response times

---

## 🛡️ Security

### Authentication & Authorization
- JWT with HTTP-only cookies
- Role-based access control
- Session management
- Password hashing (bcrypt)

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Infrastructure
- HTTPS enforcement
- Secure headers
- Environment variable protection
- Database encryption
- Regular security updates

---

## 🌐 Internationalization

### Supported Languages
- **English** (en) - Default, LTR
- **Arabic** (ar) - RTL support
- **Hebrew** (he) - RTL support

### Implementation
- i18next for translations
- RTL layout detection
- Localized date/number formatting
- Font optimization for each language
- Cultural adaptations

### Adding New Languages
1. Create translation files in `/locales/{lang}`
2. Update language configuration
3. Test RTL layouts
4. Update documentation

---

## 📞 Support & Contact

### Al Ghadeer Events
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722
- **Location**: Palestine

### Technical Support
- **Documentation**: [Wiki](https://github.com/alghadeer-events/management-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/alghadeer-events/management-system/issues)
- **Discord**: [Community Server](https://discord.gg/alghadeer-events)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Chakra UI** for the beautiful component library
- **FastAPI** for the robust backend framework
- **MongoDB** for flexible data storage
- **Google APIs** for seamless integrations
- **Vercel** for excellent frontend hosting
- **Railway** for backend deployment

---

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Core event management
- ✅ Payment tracking
- ✅ Staff management
- ✅ Basic reporting

### Phase 2 (Q2 2024)
- 🔄 Advanced analytics
- 🔄 Mobile app enhancements
- 🔄 Advanced integrations
- 🔄 Multi-tenant support

### Phase 3 (Q3 2024)
- 📋 Customer portal
- 📋 Advanced automation
- 📋 AI-powered insights
- 📋 Enterprise features

---

**Built with ❤️ for Al Ghadeer Events and the event management community**

