# 🏋️ Al Ghadeer Events Management System

A comprehensive internal event management system for hall owners to manage all aspects of events including event details, payments, employees, requests, expenses, profitability, reminders, and automatic reporting.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- MongoDB (or use Docker)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/al-ghadeer-events.git
cd al-ghadeer-events
```

2. Start all services with Docker:
```bash
docker-compose up -d
```

3. Access the applications:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- MongoDB: localhost:27017

### Local Development (without Docker)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 📁 Project Structure

```
al-ghadeer-events/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core utilities
│   │   ├── models/            # MongoDB models
│   │   ├── services/          # Business logic
│   │   ├── integrations/      # External services
│   │   └── main.py           # FastAPI app
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js TypeScript frontend
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docs/                      # Documentation
├── docker-compose.yml
└── README.md
```

## 🔧 Tech Stack

| Layer         | Technology                                |
|---------------|--------------------------------------------|
| Frontend      | TypeScript, Next.js 14, Tailwind CSS      |
| Backend       | Python 3.11, FastAPI, Pydantic           |
| Database      | MongoDB with Beanie ODM                   |
| Mobile        | Glide (MVP), React Native (future)        |
| Reporting     | ReportLab (Python PDF generation)         |
| Communication | WhatsApp Business API, Gmail SMTP         |
| Automation    | Zapier Webhooks                          |
| Storage       | Google Cloud Storage                      |

## 🌟 Features

- ✅ **Events Management** – Full lifecycle from booking to post-event
- 💵 **Financial Tracking** – Payments, expenses, profit/loss
- 👥 **Employee Management** – Assignments, labor costs, payments
- 📊 **Automated Reporting** – Monthly PDF summaries (Hebrew)
- 🌐 **Multi-language Support** – English, Hebrew, Arabic
- 📱 **Mobile-First Design** – Responsive web + mobile app
- 🔄 **Integration** – Google Sheets, Gmail, WhatsApp, Zapier
- 📆 **Calendar View + Drag & Drop** – Visual scheduling
- 🔔 **Google Calendar Sync & ICS Export**
- ⚠️ **Visual Alerts for Incomplete Events**
- 📧 **Monthly Reports by Email**
- 📤 **Excel/CSV Export**
- 📲 **Push Notifications**

## 🔐 Security

- HTTPS with SSL certificates
- JWT-based authentication
- Role-based access control (Admin, Staff)
- File validation for uploads
- Environment-based configuration
- CORS protection
- Rate limiting

## 📚 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Main Endpoints

- **Auth**: `/api/auth/*`
- **Events**: `/api/events/*`
- **Payments**: `/api/payments/*`
- **Employees**: `/api/employees/*`
- **Tasks**: `/api/tasks/*`
- **Reports**: `/api/reports/*`
- **Notifications**: `/api/notifications/*`

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📤 Deployment

### Production Deployment

1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Railway/Render
3. **Database**: MongoDB Atlas
4. **Storage**: Google Cloud Storage

See `docs/deployment.md` for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Al Ghadeer Events.

## 👥 Team

- **Backend Lead**: [Your Name]
- **Frontend Lead**: [Your Name]
- **UI/UX Designer**: [Your Name]

## 📞 Support

For support, email support@alghadeer-events.com or join our Slack channel.

