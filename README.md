# Al Ghadeer Events Management System

A comprehensive internal Event Management System for hall owners, designed to manage all aspects of events including event details, payments, employees, special requests, expenses, profitability, reminders, and automatic reporting.

## 🌟 Features

### Core Features
- **Events Management**: Complete event lifecycle management with automatic ID generation
- **Payments Tracking**: Multi-payment support with receipt uploads and outstanding balance calculations
- **Employee Management**: Labor cost tracking with payment scheduling
- **Reminders & Tasks**: Automated reminders with push notifications
- **Profitability Analysis**: Real-time profit calculations and financial insights
- **Multi-language Support**: English, Hebrew, and Arabic interface
- **Automated Reporting**: Monthly PDF reports with email and WhatsApp delivery

### Dashboard Features
- **Profitability Meter**: Visual profit indicator with color-coded status
- **Revenue vs Expenses Charts**: Interactive financial analytics
- **Event Type Distribution**: Pie charts for event categorization
- **Upcoming Events**: Real-time event calendar with alerts
- **Outstanding Balances**: Payment tracking with overdue notifications

### Advanced Features
- **Google Sheets Integration**: Data synchronization with external spreadsheets
- **Push Notifications**: Real-time alerts for reminders and payments
- **WhatsApp Integration**: Automated messaging for reports and reminders
- **File Management**: Receipt uploads and document storage
- **Export Capabilities**: Excel and PDF export functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alghadeer-events-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/alghadeer_events
   
   # Email (Gmail)
   EMAIL_USER=alghadeerevents@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # WhatsApp
   WHATSAPP_API_KEY=your-whatsapp-api-key
   WHATSAPP_PHONE_NUMBER=+970595781722
   
   # Google Sheets
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=google-credentials.json
   GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # The application will automatically create collections on first run
   ```

5. **Start the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The system will be ready to use

## 📋 System Requirements

### Minimum Requirements
- **Server**: 2GB RAM, 1 CPU core
- **Storage**: 10GB available space
- **Network**: Stable internet connection for notifications

### Recommended Requirements
- **Server**: 4GB RAM, 2 CPU cores
- **Storage**: 50GB available space
- **Network**: High-speed internet for file uploads

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Uploads**: Multer middleware
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Validation**: Express-validator

### Frontend Stack
- **Framework**: Vanilla JavaScript with Bootstrap 5
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome
- **Responsive Design**: Mobile-first approach

### External Integrations
- **Google Sheets API**: Data synchronization
- **WhatsApp Business API**: Automated messaging
- **Firebase Cloud Messaging**: Push notifications
- **Gmail SMTP**: Email delivery

## 📊 Database Schema

### Events Collection
```javascript
{
  eventId: String,           // Auto-generated unique ID
  name: String,              // Event name
  type: String,              // wedding, henna, engagement, graduation, other
  date: Date,                // Event date and time
  location: String,          // Hall Floor 0, Hall Floor 1, Garden, Waterfall
  gender: String,            // Men, Women, Mixed
  guestCount: Number,        // Number of guests
  basePrice: Number,         // Base price in Shekel
  totalCost: Number,         // Calculated total cost
  additionalRequests: Array, // Special requests (DJ, cake, etc.)
  decoration: Object,        // Decoration details
  notes: String,             // Additional notes
  status: String,            // upcoming, ongoing, completed, cancelled
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```javascript
{
  eventId: ObjectId,         // Reference to event
  receiptNumber: String,     // Auto-generated receipt number
  amount: Number,            // Payment amount
  date: Date,                // Payment date
  method: String,            // cash, card, bank_transfer, check
  status: String,            // paid, partially_paid, not_paid, overdue
  receiptFile: String,       // File path for uploaded receipt
  notes: String,             // Payment notes
  createdAt: Date,
  updatedAt: Date
}
```

### Employees Collection
```javascript
{
  eventId: ObjectId,         // Reference to event
  name: String,              // Employee name
  role: String,              // Employee role
  wage: Number,              // Wage amount
  paymentDate: Date,         // Payment due date
  status: String,            // paid, pending, overdue, cancelled
  contactInfo: String,       // Contact information
  notes: String,             // Employee notes
  createdAt: Date,
  updatedAt: Date
}
```

### Reminders Collection
```javascript
{
  title: String,             // Reminder title
  description: String,       // Reminder description
  eventId: ObjectId,         // Reference to event (optional)
  date: Date,                // Reminder date and time
  assignee: String,          // Assigned person
  type: String,              // one_time, recurring, urgent, general
  recurrencePattern: String, // Recurrence pattern for recurring reminders
  status: String,            // pending, completed, cancelled, overdue
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables

#### Required Configuration
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/alghadeer_events

# Email
EMAIL_USER=alghadeerevents@gmail.com
EMAIL_PASSWORD=your-app-password

# WhatsApp
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=+970595781722

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=google-credentials.json
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# JWT
JWT_SECRET=your-jwt-secret-key
```

#### Optional Configuration
```env
# Push Notifications
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# File Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Company Information
COMPANY_NAME=Al Ghadeer Events
COMPANY_EMAIL=alghadeerevents@gmail.com
COMPANY_PHONE=+970595781722
```

### Google Sheets Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Sheets API

2. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Download the JSON key file
   - Save as `google-credentials.json` in project root

3. **Share Google Sheet**
   - Create a new Google Sheet
   - Share with service account email (from JSON file)
   - Copy the spreadsheet ID from URL

## 📱 API Endpoints

### Events
- `GET /api/events` - Get all events with filtering
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/stats/overview` - Get event statistics

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `POST /api/payments/:id/receipt` - Upload receipt
- `GET /api/payments/:id/receipt` - Download receipt
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/outstanding/balances` - Get outstanding balances

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `PATCH /api/employees/:id/mark-paid` - Mark employee as paid
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/overdue/payments` - Get overdue payments

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/:id` - Get single reminder
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `PATCH /api/reminders/:id/complete` - Mark reminder as complete
- `PATCH /api/reminders/:id/cancel` - Cancel reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `GET /api/reminders/overdue/reminders` - Get overdue reminders

### Reports
- `POST /api/reports/monthly` - Generate monthly report
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/profitability` - Get profitability reports
- `GET /api/reports/outstanding-balances` - Get outstanding balances

### Notifications
- `POST /api/notifications/email` - Send email notification
- `POST /api/notifications/whatsapp` - Send WhatsApp message
- `POST /api/notifications/push` - Send push notification
- `POST /api/notifications/payment-reminder` - Send payment reminder
- `POST /api/notifications/reminder-notification` - Send reminder notification

### Google Sheets
- `POST /api/google-sheets/sync/all` - Sync all data to Google Sheets
- `POST /api/google-sheets/sync/events` - Sync events data
- `POST /api/google-sheets/sync/payments` - Sync payments data
- `POST /api/google-sheets/sync/employees` - Sync employees data
- `POST /api/google-sheets/sync/reminders` - Sync reminders data
- `GET /api/google-sheets/read/:sheetName` - Read data from Google Sheet

## 🎯 Usage Guide

### Adding a New Event

1. **Navigate to Events Page**
   - Click on "Events" in the navigation menu

2. **Click "Add Event"**
   - Fill in event details:
     - Event name
     - Event type (dropdown with "other" option for free text)
     - Date and time (calendar picker)
     - Location (dropdown)
     - Gender (Men/Women/Mixed)
     - Guest count
     - Base price

3. **Add Special Requests**
   - Check boxes for DJ, cake, fruits, nuts, custom items
   - Specify quantities and costs
   - Choose provider (hall/client)

4. **Add Decoration**
   - Select standard or customized
   - Add description and cost if customized

5. **Save Event**
   - Event ID will be automatically generated
   - Total cost will be calculated automatically

### Managing Payments

1. **Navigate to Payments Page**
   - Click on "Payments" in the navigation menu

2. **Add Payment**
   - Select the event
   - Enter payment amount
   - Choose payment method
   - Set payment date
   - Upload receipt (optional)
   - Add notes

3. **Track Outstanding Balances**
   - View outstanding balances in dashboard
   - Send payment reminders via WhatsApp/email

### Managing Employees

1. **Navigate to Employees Page**
   - Click on "Employees" in the navigation menu

2. **Add Employee**
   - Select the event
   - Enter employee name and role
   - Set wage amount
   - Set payment date
   - Add contact information and notes

3. **Track Labor Costs**
   - View total labor cost per event
   - Track overdue payments
   - Mark employees as paid

### Setting Up Reminders

1. **Navigate to Reminders Page**
   - Click on "Reminders" in the navigation menu

2. **Add Reminder**
   - Enter title and description
   - Select related event (optional)
   - Set date and time
   - Assign to person
   - Choose reminder type (one-time/recurring)
   - Set recurrence pattern if needed

3. **Use Predefined Reminders**
   - Click on predefined reminder buttons
   - Customize as needed

### Generating Reports

1. **Navigate to Reports Page**
   - Click on "Reports" in the navigation menu

2. **View Dashboard Statistics**
   - Profitability meter
   - Revenue vs expenses charts
   - Event type distribution
   - Upcoming events
   - Outstanding balances

3. **Generate Monthly Report**
   - Click "Generate Monthly Report"
   - Report will be sent via email and WhatsApp
   - PDF will be available for download

4. **Generate Custom Report**
   - Select date range
   - Choose report type
   - Generate and download

## 🔒 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### File Security
- File type validation
- File size limits
- Secure file storage
- Virus scanning (optional)

### API Security
- Rate limiting
- Request validation
- Error handling
- Logging and monitoring

## 📈 Monitoring & Maintenance

### Health Checks
- API health endpoint: `GET /api/health`
- Database connectivity monitoring
- External service status checks

### Logging
- Application logs in `logs/app.log`
- Error tracking and reporting
- Performance monitoring

### Backup
- Automated database backups
- File system backups
- Configuration backups

### Updates
- Regular security updates
- Feature updates
- Bug fixes

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string in .env file
MONGODB_URI=mongodb://localhost:27017/alghadeer_events
```

#### Email Configuration Issues
```bash
# Check Gmail app password
# Enable 2-factor authentication
# Generate app password for EMAIL_PASSWORD
```

#### File Upload Issues
```bash
# Check upload directory permissions
chmod 755 uploads/

# Check file size limits in .env
MAX_FILE_SIZE=5242880
```

#### Google Sheets Integration Issues
```bash
# Verify service account credentials
# Check spreadsheet sharing permissions
# Validate spreadsheet ID in .env
```

### Performance Optimization

#### Database Optimization
```javascript
// Add indexes for frequently queried fields
db.events.createIndex({ "date": 1 })
db.payments.createIndex({ "eventId": 1 })
db.employees.createIndex({ "eventId": 1 })
db.reminders.createIndex({ "date": 1 })
```

#### Caching
```javascript
// Enable Redis caching (optional)
REDIS_URL=redis://localhost:6379
```

#### Compression
```javascript
// Enable gzip compression
app.use(compression())
```

## 🤝 Support

### Contact Information
- **Company**: Al Ghadeer Events
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722

### Documentation
- API Documentation: Available at `/api/docs` (when implemented)
- User Guide: Available in the application help section
- Video Tutorials: Available on company YouTube channel

### Bug Reports
- Create an issue in the project repository
- Include detailed error description
- Attach relevant logs and screenshots

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap for the responsive UI framework
- Chart.js for data visualization
- Font Awesome for icons
- MongoDB for the database
- Express.js for the web framework
- All contributors and testers

---

**Al Ghadeer Events Management System** - Streamlining event management for hall owners since 2024.
