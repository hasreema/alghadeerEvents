# Al Ghadeer Events Management System 🎉

![Al Ghadeer Events Logo](assets/alghadeer-logo.png)

## 📋 Overview

Al Ghadeer Events Management System is a comprehensive internal event management solution designed specifically for hall owners to manage all aspects of their events business. The system provides complete control over events, payments, employees, reminders, and generates automated reports with profitability tracking.

### 🌟 Key Features

- **📅 Complete Event Management**: Track event details, pricing, locations, and guest information
- **💰 Payment Tracking**: Monitor payments, receipts, and outstanding balances
- **👥 Employee Management**: Manage staff assignments, wages, and payment schedules
- **🔔 Smart Reminders**: Automated notifications and task management
- **📊 Dashboard Analytics**: Real-time profitability meters and business insights
- **📱 Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **🌐 Multi-Language Support**: English, Hebrew, and Arabic with RTL support
- **📄 Automated Reports**: Monthly PDF reports sent via email and WhatsApp
- **☁️ Cloud-Based**: Built on Google Sheets with Glide app interface

---

## 🚀 Quick Start Guide

### 1. Google Sheets Setup

#### Step 1: Create Your Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Al Ghadeer Events Database"
3. Copy the data from `google-sheets-template.csv` into separate sheets:
   - **Events** - Main event management
   - **Payments** - Payment tracking and receipts
   - **EmployeesPayments** - Staff wages and payments
   - **PriceList** - Default pricing for services
   - **Reminders** - Task and reminder management
   - **Contacts** - Event contact information
   - **Tasks** - Operational task tracking
   - **Languages** - Multi-language translations

#### Step 2: Configure Sheet Permissions
1. Share the spreadsheet with your team
2. Set appropriate viewing/editing permissions
3. Note the spreadsheet URL for Glide setup

### 2. Glide App Setup

#### Step 1: Create Your App
1. Visit [Glide Apps](https://glideapps.com)
2. Create a new project
3. Choose "Google Sheets" as data source
4. Connect your Al Ghadeer Events Database spreadsheet

#### Step 2: Configure App Structure
1. Import the configuration from `glide-app-config.json`
2. Set up the navigation tabs:
   - 📊 Dashboard
   - 📅 Events
   - 💳 Payments
   - 👥 Employees
   - 🔔 Reminders

#### Step 3: Customize App Design
1. Upload the Al Ghadeer Events logo
2. Set theme colors:
   - Primary: `#2E8B57` (Sea Green)
   - Secondary: `#DAA520` (Goldenrod)
   - Background: `#F5F5F5`
3. Configure RTL support for Hebrew/Arabic

### 3. Zapier Automation Setup

#### Step 1: Create Zapier Account
1. Sign up at [Zapier.com](https://zapier.com)
2. Connect your Google Sheets account
3. Connect email service (Gmail recommended)
4. Set up WhatsApp Business API or Twilio

#### Step 2: Import Automation Templates
Use the configurations from `zapier-automations.json` to set up:

1. **Monthly Report Automation**
   - Trigger: 1st of every month at 9:00 AM
   - Actions: Generate PDF report, send via email & WhatsApp

2. **Payment Reminder System**
   - Trigger: Daily at 10:00 AM
   - Actions: Check overdue payments, send WhatsApp reminders

3. **Task Reminder Notifications**
   - Trigger: Every hour
   - Actions: Check due reminders, send push notifications

4. **New Event Notifications**
   - Trigger: New row in Events sheet
   - Actions: Notify team via WhatsApp

#### Step 3: Test Automations
1. Test each automation with sample data
2. Verify email and WhatsApp delivery
3. Adjust timing and recipients as needed

---

## 📱 User Guide

### Event Management

#### Creating a New Event
1. Go to **Events** tab
2. Tap **"Add New Event"**
3. Fill in event details:
   - **Event Name**: Descriptive name
   - **Event Type**: Wedding, Henna, Engagement, Graduation, Other
   - **Date & Time**: Select from calendar and time picker
   - **Location**: Hall Floor 0/1, Garden, or Waterfall
   - **Guest Count**: Number of expected guests
   - **Base Price**: Starting price in shekels (₪)

#### Additional Services Configuration
Use checkboxes to select additional services:
- **DJ Service**: Cost and provider (Hall/Client)
- **Cake**: Quantity, cost, and provider
- **Fruits**: Cost and provider
- **Nuts**: Cost and provider
- **Custom Requests**: Add custom services with costs

#### Decoration Options
- **Standard**: Basic hall decoration
- **Customized**: Detailed description of custom requirements

### Payment Management

#### Recording Payments
1. Go to **Payments** tab
2. Tap **"Add Payment"**
3. Select the related event
4. Enter payment details:
   - **Amount**: Payment amount in shekels
   - **Date**: Payment date
   - **Method**: Cash, Bank Transfer, Credit Card, Check
   - **Type**: Full, Partial, or Deposit
5. Upload receipt image (optional)

#### Payment Status Tracking
The system automatically calculates:
- **Paid**: Full payment received
- **Partially Paid**: Some payment received
- **Not Paid**: No payment received

### Employee Management

#### Adding Employee Payments
1. Go to **Employees** tab
2. Tap **"Add Employee Payment"**
3. Select related event
4. Enter employee details:
   - **Name**: Employee full name
   - **Role**: Waiter, Kitchen Staff, Security, etc.
   - **Hourly Wage**: Rate per hour in shekels
   - **Hours Worked**: Total hours for the event
5. System automatically calculates total wage

### Reminders & Tasks

#### Creating Reminders
1. Go to **Reminders** tab
2. Tap **"Add Reminder"**
3. Set reminder details:
   - **Title**: Brief description
   - **Description**: Detailed instructions
   - **Date & Time**: When to be reminded
   - **Assigned To**: Team member responsible
   - **Type**: Pre-Event, Post-Event, Payment, Maintenance, General

#### Recurring Reminders
- Enable **"Recurring Reminder"** checkbox
- Select frequency: Daily, Weekly, Monthly, Yearly
- System will automatically create future reminders

### Dashboard Analytics

#### Profitability Meter
Visual indicator showing business health:
- 🟢 **Green (60-100%)**: Excellent profitability
- 🟡 **Yellow (30-60%)**: Good profitability
- 🔴 **Red (0-30%)**: Needs attention

#### Financial Overview
- **Total Revenue**: Sum of all event income
- **Total Expenses**: Employee costs + additional services
- **Net Profit**: Revenue minus expenses
- **Outstanding Balances**: Unpaid amounts

#### Charts and Analytics
- **Revenue vs Expenses**: Monthly comparison
- **Profitability by Event Type**: Performance analysis
- **Upcoming Events**: Next scheduled events
- **Payment Alerts**: Overdue balances

---

## 🔧 Advanced Configuration

### Multi-Language Setup

#### Language Configuration
1. The system supports English, Hebrew, and Arabic
2. Default language is English
3. Users can switch languages from settings
4. All translations are stored in the Languages sheet

#### Adding New Translations
1. Go to Languages sheet in Google Sheets
2. Add new language column
3. Translate all interface terms
4. Update Glide app language settings

### Custom Fields and Formulas

#### Event Pricing Calculations
```
Total Price = Base Price + DJ Cost + Cake Cost + Fruits Cost + 
              Nuts Cost + Custom Requests + Decoration Cost
```

#### Profitability Calculations
```
Net Profit = Total Income - (Employee Costs + Service Costs)
Profitability % = (Net Profit / Total Income) × 100
```

#### Payment Status Logic
```
IF SUM(Payments) >= Total Price THEN "Paid"
ELSE IF SUM(Payments) > 0 THEN "Partially Paid"
ELSE "Not Paid"
```

### Report Customization

#### Monthly Report Content
The automated PDF report includes:
- Financial summary (revenue, expenses, profit)
- Event details and payment status
- Employee payment summary
- Outstanding balance report
- Profitability metrics and charts

#### Custom Report Templates
1. Modify `monthly-report-template.html`
2. Update Zapier PDF generation step
3. Test with sample data
4. Deploy updated template

---

## 🔐 Security & Privacy

### Data Protection
- All data stored in Google Sheets with enterprise-grade security
- Access controlled through Google account permissions
- Regular automated backups
- HTTPS encryption for all communications

### User Access Management
1. **Admin Users**: Full access to all features
2. **Staff Users**: Limited access to specific events
3. **View-Only**: Dashboard and reports access only

### Privacy Compliance
- Customer contact information encrypted
- Payment data secured according to financial standards
- Regular security audits and updates

---

## 📞 Support & Contact

### Al Ghadeer Events Contact Information
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722
- **Company**: Al Ghadeer Events (אירועי אל ע'דיר)

### Technical Support
- **Platform**: Glide Apps Community
- **Documentation**: This README file
- **Updates**: Automatic via cloud platforms

### Troubleshooting Common Issues

#### App Not Loading
1. Check internet connection
2. Verify Google Sheets permissions
3. Clear browser cache
4. Contact Glide support if issues persist

#### Automations Not Working
1. Check Zapier connection status
2. Verify Google Sheets triggers
3. Test webhook endpoints
4. Review automation logs in Zapier

#### Data Sync Issues
1. Refresh the app
2. Check Google Sheets formula errors
3. Verify data format consistency
4. Re-sync data source in Glide

---

## 🆕 Updates & Roadmap

### Recent Updates
- ✅ Multi-language support (English, Hebrew, Arabic)
- ✅ Automated monthly reports
- ✅ WhatsApp integration
- ✅ Receipt upload functionality
- ✅ Profitability dashboard

### Upcoming Features
- 📊 Advanced analytics and forecasting
- 📱 Native mobile app
- 🔗 Integration with accounting software
- 🎨 Enhanced customization options
- 📧 Email marketing integration

---

## 📄 License & Terms

This Al Ghadeer Events Management System is a proprietary solution designed specifically for Al Ghadeer Events. All rights reserved.

### Usage Terms
- Licensed for internal use by Al Ghadeer Events only
- No redistribution or resale permitted
- Technical support included for first year
- Updates and improvements provided as available

---

**Built with ❤️ for Al Ghadeer Events**

*Last updated: January 2024*
