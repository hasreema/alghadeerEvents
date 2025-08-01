# Al Ghadeer Events - Event Management System

A comprehensive internal Event Management System for hall owners, designed to manage all aspects of events including event details, payments, employees, special requests, expenses, profitability, reminders, and automatic reporting.

## 🌟 Features

### 📅 Events Management
- **Event Details**: Name, type (wedding, henna, engagement, graduation, other), date & time, location, gender, guest count
- **Special Requests**: DJ, cake, fruits, nuts, custom items with quantity, cost, and provider
- **Decoration**: Standard/customized with description and cost
- **Dynamic Pricing**: Base price with automatic total cost calculation
- **Event ID**: Automatically generated unique identifiers
- **Notes**: Free text field for additional information

### 💰 Payments Management
- **Payment Status**: Paid, Partially paid, Not paid
- **Multiple Payments**: Track partial payments with dates and amounts
- **Receipt Upload**: Support for images and PDFs
- **Automatic Calculations**: Outstanding balance calculation
- **Payment Methods**: Cash, Card, Bank Transfer, Check, Other

### 👥 Employees & Labor Costs
- **Employee Management**: Add employees per event with name, role, wage
- **Payment Tracking**: Payment dates, status, and notes
- **Automatic Calculations**: Total labor cost per event
- **Roles**: Waiter, Chef, Cleaner, Manager, Other

### 📊 Expenses & Profitability
- **Automatic Calculations**: Total income, total expenses, net profit, profitability percentage
- **Cost Differentiation**: Hall-provided vs. client-provided items
- **Real-time Updates**: Dynamic profitability tracking

### 🔔 Reminders & Tasks
- **Reminder Types**: Payment, maintenance, preparation, follow-up, general
- **Assignment**: Assign reminders to specific people
- **Recurring Reminders**: Support for recurring patterns
- **Predefined Reminders**: Quick setup for common tasks
- **Status Tracking**: Pending, completed, cancelled

### 📈 Dashboard & Analytics
- **Profitability Meter**: Visual indicator with color coding (Green/Yellow/Red)
- **Revenue vs Expenses**: Bar chart visualization
- **Event Distribution**: Pie chart by event type and location
- **Alerts**: Upcoming events and outstanding balances
- **Quick Actions**: Fast access to common tasks

### 📋 Reports
- **Monthly Reports**: Automatic PDF generation in Hebrew
- **Email & WhatsApp**: Automated delivery on the 1st of each month
- **Manual Trigger**: Generate reports on demand from dashboard
- **Content**: Revenue, expenses, profit, events, balances, employees, graphs
- **Export Options**: CSV export for data analysis

### 🔔 Notifications
- **Push Notifications**: For reminders, unpaid balances, and critical alerts
- **Email Notifications**: Monthly reports and payment reminders
- **WhatsApp Integration**: Automated messaging for reports and alerts

### 🌍 Multi-language Support
- **Languages**: English (default), Hebrew, Arabic
- **Dynamic UI**: Text pulled from language configuration
- **Reports**: Generated in Hebrew by default

## 🏗️ Technical Architecture

### Backend (Node.js + Express)
- **Framework**: Express.js with middleware for security and performance
- **Database**: MongoDB with Mongoose ODM
- **API Validation**: express-validator for input validation
- **Security**: helmet, cors, express-rate-limit, compression
- **File Uploads**: multer for handling receipt uploads
- **PDF Generation**: pdfkit for report generation
- **Email Service**: nodemailer for email notifications
- **Google Sheets Integration**: googleapis for data synchronization

### Frontend (HTML5 + CSS3 + JavaScript)
- **UI Framework**: Bootstrap 5 for responsive design
- **Icons**: Font Awesome for consistent iconography
- **Charts**: Chart.js for data visualization
- **Modals**: Bootstrap modals for forms and details
- **Responsive Design**: Mobile-friendly interface

### Data Sources
- **Primary**: MongoDB database for real-time operations
- **Secondary**: Google Sheets for backup and external access
- **Sync**: Bidirectional synchronization between MongoDB and Google Sheets

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Sheets API credentials
- Email service (Gmail recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd alghadeer-events
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/alghadeer_events
MONGODB_URI_PROD=mongodb://your-production-uri

# Email Configuration
EMAIL_USER=alghadeerevents@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SERVICE=gmail

# WhatsApp Configuration
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=+970595781722

# Google Sheets Configuration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account-email
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Company Information
COMPANY_NAME=AlghadeerEvents
COMPANY_EMAIL=alghadeerevents@gmail.com
COMPANY_WHATSAPP=+970595781722
COMPANY_LOGO=/images/logo.png

# Default Settings
DEFAULT_LANGUAGE=en
TIMEZONE=Asia/Jerusalem
CURRENCY=ILS
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create collections on first run
```

### 5. Google Sheets Setup
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a service account
4. Download the JSON credentials
5. Share your Google Sheets with the service account email

### 6. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 📱 Usage Guide

### Dashboard
- **Overview**: View key metrics and profitability indicators
- **Quick Actions**: Add events, payments, employees, or generate reports
- **Charts**: Visual representation of revenue, expenses, and event distribution
- **Recent Events**: Latest events with quick access to details

### Events Management
1. **Add Event**: Click "Add New Event" and fill in the required details
2. **Event Types**: Select from predefined types or use "Other" with custom text
3. **Location**: Choose from available venues (Hall Floor 0, Hall Floor 1, Garden, Waterfall)
4. **Special Requests**: Add additional services with costs and providers
5. **Decoration**: Specify decoration type and costs
6. **Filter & Search**: Use filters to find specific events

### Payments Management
1. **Add Payment**: Link payments to specific events
2. **Receipt Upload**: Upload receipt images or PDFs
3. **Status Tracking**: Monitor payment status and outstanding balances
4. **Multiple Payments**: Record partial payments for the same event

### Employees Management
1. **Add Employee**: Assign employees to specific events
2. **Role Assignment**: Define roles and wages
3. **Payment Tracking**: Monitor employee payment status
4. **Overdue Alerts**: Get notified of overdue employee payments

### Reminders Management
1. **Create Reminders**: Set up task reminders with due dates
2. **Quick Reminders**: Use predefined templates for common tasks
3. **Assignment**: Assign reminders to specific people
4. **Status Updates**: Mark reminders as completed or cancelled

### Reports & Analytics
1. **Monthly Reports**: Generate comprehensive monthly reports
2. **Profitability Analysis**: View detailed profitability breakdowns
3. **Export Data**: Export data to CSV for external analysis
4. **Charts**: Visual analytics for business insights

## 🔧 API Endpoints

### Events
- `GET /api/events` - Get all events with filtering and pagination
- `GET /api/events/:id` - Get specific event with profitability calculations
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/stats/overview` - Get event statistics

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get specific payment
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `POST /api/payments/:id/receipt` - Upload receipt
- `GET /api/payments/:id/receipt` - Download receipt
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/outstanding/balances` - Get outstanding balances

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `PATCH /api/employees/:id/mark-paid` - Mark employee as paid
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/overdue/payments` - Get overdue payments
- `GET /api/employees/upcoming/payments` - Get upcoming payments

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/:id` - Get specific reminder
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `PATCH /api/reminders/:id/complete` - Mark reminder as completed
- `PATCH /api/reminders/:id/cancel` - Cancel reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `GET /api/reminders/overdue/reminders` - Get overdue reminders

### Reports
- `POST /api/reports/monthly` - Generate monthly report
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/profitability` - Get profitability data
- `GET /api/reports/outstanding-balances` - Get outstanding balances

### Notifications
- `POST /api/notifications/email` - Send email notification
- `POST /api/notifications/whatsapp` - Send WhatsApp message
- `POST /api/notifications/push` - Send push notification
- `POST /api/notifications/payment-reminder` - Send payment reminder
- `POST /api/notifications/reminder-notification` - Send reminder notification

### Google Sheets Integration
- `POST /api/google-sheets/sync/all` - Sync all data to Google Sheets
- `POST /api/google-sheets/sync/events` - Sync events data
- `POST /api/google-sheets/sync/payments` - Sync payments data
- `POST /api/google-sheets/sync/employees` - Sync employees data
- `POST /api/google-sheets/sync/reminders` - Sync reminders data
- `GET /api/google-sheets/read/:sheetName` - Read data from Google Sheets
- `GET /api/google-sheets/test-connection` - Test Google Sheets connection

## 🔒 Security Features

- **Input Validation**: All inputs validated using express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers for protection against common vulnerabilities
- **File Upload Security**: Restricted file types and sizes
- **Environment Variables**: Sensitive data stored in environment variables

## 📊 Data Models

### Event Schema
```javascript
{
  eventName: String,
  eventType: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  gender: String,
  guestCount: Number,
  basePrice: Number,
  totalCost: Number,
  additionalRequests: [{
    item: String,
    quantity: Number,
    cost: Number,
    provider: String
  }],
  decoration: {
    type: String,
    description: String,
    cost: Number
  },
  notes: String,
  status: String
}
```

### Payment Schema
```javascript
{
  eventId: ObjectId,
  amount: Number,
  date: Date,
  method: String,
  status: String,
  receiptFile: String,
  notes: String,
  receiptNumber: String
}
```

### Employee Schema
```javascript
{
  eventId: ObjectId,
  name: String,
  role: String,
  wage: Number,
  paymentDate: Date,
  paymentStatus: String,
  contactInfo: String,
  notes: String
}
```

### Reminder Schema
```javascript
{
  title: String,
  description: String,
  eventId: ObjectId,
  date: Date,
  assignee: String,
  type: String,
  recurrencePattern: String,
  status: String
}
```

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up production MongoDB instance
3. **SSL Certificate**: Configure HTTPS for security
4. **Process Manager**: Use PM2 for process management
5. **Reverse Proxy**: Configure Nginx for load balancing

### Docker Deployment
```bash
# Build Docker image
docker build -t alghadeer-events .

# Run container
docker run -p 3000:3000 --env-file .env alghadeer-events
```

### Cloud Deployment
- **Heroku**: Deploy directly from GitHub
- **AWS**: Use Elastic Beanstalk or EC2
- **Google Cloud**: Use App Engine or Compute Engine
- **Azure**: Use App Service or Virtual Machines

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password
- `WHATSAPP_API_KEY`: WhatsApp Business API key
- `GOOGLE_SHEETS_CLIENT_EMAIL`: Google service account email
- `GOOGLE_SHEETS_PRIVATE_KEY`: Google service account private key
- `JWT_SECRET`: JWT signing secret
- `COMPANY_NAME`: Company name for branding
- `DEFAULT_LANGUAGE`: Default application language

### Customization
- **Branding**: Update company information in environment variables
- **Languages**: Add new languages in the translations file
- **Event Types**: Modify event types in the frontend configuration
- **Locations**: Update available locations in the frontend
- **Roles**: Customize employee roles as needed

## 📞 Support & Contact

- **Company**: AlghadeerEvents
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722
- **Website**: [Company Website]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 Changelog

### Version 1.0.0
- Initial release
- Complete event management system
- Payment tracking and management
- Employee management
- Reminder system
- Reports and analytics
- Multi-language support
- Google Sheets integration
- Email and WhatsApp notifications

---

**Built with ❤️ for Al Ghadeer Events**
