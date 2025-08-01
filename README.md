Al Ghadeer Events – Event Management System

# Al Ghadeer Events - Event Management System

A comprehensive internal event management system for hall owners to manage all aspects of events including event details, payments, employees, requests, expenses, profitability, reminders, and automatic reporting.

## 🎯 System Overview

This system is designed specifically for hall owners (not customers) to manage:
- **Events Management**: Complete event lifecycle from booking to completion
- **Financial Tracking**: Payments, expenses, profitability analysis
- **Employee Management**: Labor costs, roles, and payments
- **Automated Reporting**: Monthly PDF reports in Hebrew
- **Multi-language Support**: English, Hebrew, Arabic
- **Mobile-First Design**: Optimized for mobile devices
- **Integration**: Google Sheets data source with Zapier automations

## 🏗️ System Architecture

### Data Structure (Google Sheets)
- **Events**: Event details, pricing, profitability calculations
- **EmployeesPayments**: Employee records, roles, wages, payments
- **PriceList**: Default pricing for services and items
- **Payments**: Event payments, receipts, outstanding balances
- **Reminders**: One-time and recurring reminders with assignments
- **Contacts**: Additional event contacts
- **Tasks**: Team tasks and operational actions

### Core Features

#### 1. Events Management
- Event details with dropdown selections for type and location
- Dynamic pricing with automatic total calculation
- Special requests and additions (DJ, cake, fruits, nuts, custom)
- Decoration options (standard or customized)
- Guest count and gender specifications

#### 2. Financial Management
- Payment status tracking (Paid/Partially paid/Not paid)
- Multiple partial payments with receipt uploads
- Automatic outstanding balance calculation
- Profitability analysis with visual indicators

#### 3. Employee & Labor Management
- Employee assignment per event
- Role-based wage tracking
- Automatic total labor cost calculation
- Payment date tracking

#### 4. Dashboard & Analytics
- Profitability meter (Green/Yellow/Red)
- Revenue vs expenses charts
- Profitability by event type & location
- Upcoming events and outstanding balance alerts

#### 5. Automation & Reporting
- Monthly PDF reports in Hebrew
- Email and WhatsApp notifications
- Push notifications for reminders
- Manual report generation

## 🌟 Advanced Features
- **Google Sheets Integration**: Data synchronization with external spreadsheets
- **Push Notifications**: Real-time alerts for reminders and payments
- **WhatsApp Integration**: Automated messaging for reports and reminders
- **File Management**: Receipt uploads and document storage
- **Export Capabilities**: Excel and PDF export functionality

## 🚀 Setup Instructions

### 1. Google Sheets Setup
1. Create a new Google Sheets document
2. Set up the following sheets with the provided structure:
   - Events
   - EmployeesPayments
   - PriceList
   - Payments
   - Reminders
   - Contacts
   - Tasks

### 2. Glide App Setup
1. Go to [Glide Apps](https://glideapps.com) and sign in
2. Create a new project and select 'Google Sheets' as data source
3. Link your Google Sheets document
4. Configure the following tabs:
   - Dashboard
   - Events
   - Payments
   - Employees
   - Reminders
   - Tasks

### 3. Zapier Automation Setup
1. Create a Zapier account at [zapier.com](https://zapier.com)
2. Set up triggers for:
   - Monthly report generation (1st of each month)
   - Payment reminders
   - Event reminders
3. Configure actions for:
   - PDF report generation
   - Email notifications
   - WhatsApp messages
   - Push notifications

## 📱 Mobile Features
- Responsive design optimized for mobile devices
- Touch-friendly interface
- Offline capability for basic functions
- Push notifications for important updates

## 🌐 Multi-language Support
- Default: English
- Available languages: Hebrew, Arabic
- Dynamic UI text from language configuration
- Reports generated in Hebrew by default

## 📊 Reporting Features
- **Monthly Reports**: Automatic generation on 1st of each month
- **Content**: Revenue, expenses, profit, events, balances, employees
- **Format**: PDF with graphs and charts
- **Delivery**: Email and WhatsApp
- **Manual Trigger**: Available from dashboard

## 🔔 Notification System
- **Push Notifications**: For reminders and critical alerts
- **Email**: Monthly reports and payment reminders
- **WhatsApp**: Monthly reports and urgent notifications
- **In-app**: Real-time updates and alerts

## 💰 Pricing Structure
- Base pricing per event type
- Dynamic pricing adjustments
- Automatic total calculation
- Support for multiple currencies (default: Shekel)

## 🎨 Event Types & Locations
### Event Types
- Wedding
- Henna
- Engagement
- Graduation
- Other (custom text input)

### Locations
- Hall Floor 0
- Hall Floor 1
- Garden
- Waterfall

## 🏗️ Technical Architecture
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: Glide (no-code app) + Bootstrap for responsive web
- **Authentication**: JWT
- **Integrations**: Google Sheets API, WhatsApp API, Zapier
- **PDF Generation**: PDFKit
- **Email**: Gmail SMTP with Nodemailer

## 🔧 Technical Requirements
- **Data Source**: Google Sheets
- **Platform**: Glide (mobile-friendly)
- **Automation**: Zapier
- **File Support**: Images & PDFs for receipts
- **Languages**: English, Hebrew, Arabic

## 📋 Priority Features (MVP)
1. ✅ Events & payments management with receipts upload
2. ✅ Employees and cost tracking
3. ✅ Dashboard with profitability meter & charts
4. ✅ Reminders with push notifications
5. ✅ Monthly PDF reports in Hebrew (email + WhatsApp)

## 📞 Contact Information
- **Company**: Al Ghadeer Events
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722

**Note**: This system is designed for internal use by hall owners and staff, not for customer-facing operations.

