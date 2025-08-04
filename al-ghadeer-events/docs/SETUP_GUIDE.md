# AlghadeerEvents - Complete Setup Guide

## Overview
This guide provides step-by-step instructions to set up the complete Event Management System for AlghadeerEvents, including Google Sheets database, Glide app deployment, and Zapier automations.

## Prerequisites
- Google Account (for Google Sheets and Apps Script)
- Glide Account (for app deployment)
- Zapier Account (for automations)
- WhatsApp Business Account (for notifications)

## Phase 1: Google Sheets Database Setup

### Step 1: Create Google Sheets Database
1. **Create a new Google Sheets document**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new blank spreadsheet
   - Name it "AlghadeerEvents Database"

2. **Import the CSV files**
   - Create 8 separate sheets using the provided CSV files:
     - `Events` (from `sheets/Events.csv`)
     - `Payments` (from `sheets/Payments.csv`)
     - `EmployeesPayments` (from `sheets/EmployeesPayments.csv`)
     - `PriceList` (from `sheets/PriceList.csv`)
     - `Reminders` (from `sheets/Reminders.csv`)
     - `Contacts` (from `sheets/Contacts.csv`)
     - `Tasks` (from `sheets/Tasks.csv`)
     - `Languages` (from `sheets/Languages.csv`)

3. **Set up formulas for automatic calculations**
   ```javascript
   // In Events sheet, add calculated columns:
   // Column AH (TotalPrice): =SUM(S2:W2)+X2+Z2+AB2+AD2+AF2
   // Column AI (NetProfit): =AH2-SUM of employee costs for this event
   ```

4. **Configure data validation**
   - Event Type: Data validation list (Wedding, Henna, Engagement, Graduation, Other)
   - Location: Data validation list (Hall Floor 0, Hall Floor 1, Garden, Waterfall)
   - Gender: Data validation list (Men, Women, Mixed)
   - Payment Status: Data validation list (Paid, Partially Paid, Not Paid)

### Step 2: Google Sheets API Setup
1. **Enable Google Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create service account credentials
   - Download the JSON key file

2. **Share the spreadsheet**
   - Share with the service account email (found in JSON file)
   - Give "Editor" permission
   - Copy the Spreadsheet ID from the URL

## Phase 2: Glide App Setup

### Step 1: Create Glide Account and Project
1. **Sign up for Glide**
   - Go to [glideapps.com](https://glideapps.com)
   - Create account using Google login
   - Choose "Apps" for the project type

2. **Connect Google Sheets**
   - Select "Google Sheets" as data source
   - Connect your Google account
   - Select the AlghadeerEvents Database spreadsheet
   - Import all 8 sheets

### Step 2: Configure App Structure
1. **App Settings**
   - Name: "AlghadeerEvents Management"
   - Icon: Upload the company logo
   - Primary Color: #C9B037 (Gold)
   - Secondary Color: #FFD700

2. **Create Tabs**
   Using the configuration from `glide/app-config.json`:
   - Dashboard (Home tab with analytics)
   - Events (List and forms)
   - Payments (Payment tracking)
   - Employees (Staff management)
   - Reminders (Task reminders)
   - Tasks (Operational tasks)

### Step 3: Configure Forms and Views
1. **Events Tab**
   - Create form with all fields from Events sheet
   - Set up dropdown choices as specified
   - Configure conditional fields (DJ Cost appears when DJ is selected)
   - Add price calculation logic

2. **Payments Tab**
   - Create payment entry form
   - Set up file upload for receipts
   - Configure automatic balance calculations

3. **Dashboard**
   - Add charts for revenue vs expenses
   - Create profitability meter
   - Add upcoming events cards
   - Configure "Send Report" button

### Step 4: Set up Multi-Language Support
1. **Configure Language Settings**
   - Use the Languages sheet for translations
   - Set default language to English
   - Add language switcher in settings
   - Configure RTL support for Arabic/Hebrew

## Phase 3: Zapier Automation Setup

### Step 1: Create Zapier Account
1. **Sign up for Zapier**
   - Go to [zapier.com](https://zapier.com)
   - Create account
   - Subscribe to appropriate plan (for webhooks and advanced features)

### Step 2: Set Up Monthly Report Automation
1. **Create "Monthly Report" Zap**
   - Trigger: Schedule by Zapier (Monthly, 1st day, 9:00 AM)
   - Action 1: Google Sheets (Get Many Rows) - Events sheet
   - Action 2: Google Sheets (Get Many Rows) - Payments sheet
   - Action 3: Google Sheets (Get Many Rows) - EmployeesPayments sheet
   - Action 4: PDF Generator (using Hebrew template)
   - Action 5: Gmail (Send Email) to alghadeerevents@gmail.com
   - Action 6: WhatsApp Business (Send Message) to +970595781722

2. **Configure PDF Template**
   - Upload the `monthly_report_hebrew.html` template
   - Map data fields from Google Sheets
   - Set Hebrew language and RTL direction

### Step 3: Set Up Payment Reminders
1. **Create "Payment Reminder" Zap**
   - Trigger: Schedule by Zapier (Daily, 10:00 AM)
   - Filter: Only if outstanding balance > 0
   - Action 1: Gmail (Send alert to office)
   - Action 2: WhatsApp (Send summary)

### Step 4: Set Up Event Notifications
1. **Create "New Event" Zap**
   - Trigger: Google Sheets (New Row in Events)
   - Action 1: WhatsApp (Notify team)
   - Action 2: Gmail (Send confirmation)

### Step 5: Manual Report Webhook
1. **Create webhook URL in Zapier**
2. **Add webhook URL to Glide dashboard button**
3. **Configure manual report generation**

## Phase 4: WhatsApp Business Integration

### Step 1: Set Up WhatsApp Business
1. **WhatsApp Business Account**
   - Set up WhatsApp Business with +970595781722
   - Verify the number
   - Configure business profile

2. **WhatsApp API Integration**
   - Use Zapier's WhatsApp integration or
   - Set up WhatsApp Business API (for advanced features)

## Phase 5: Testing and Deployment

### Step 1: Test All Features
1. **Data Entry Testing**
   - Create test events
   - Add test payments
   - Assign test employees
   - Create test reminders

2. **Automation Testing**
   - Test manual report generation
   - Verify email delivery
   - Check WhatsApp notifications

3. **Multi-Language Testing**
   - Switch between languages
   - Verify translations
   - Test RTL layout

### Step 2: Deploy to Production
1. **Glide App Publishing**
   - Publish the app
   - Set up custom domain (optional)
   - Configure user access

2. **Final Configuration**
   - Update all webhook URLs
   - Configure production email settings
   - Set up backup schedules

## Phase 6: Training and Maintenance

### Step 1: User Training
1. **Create user accounts**
2. **Conduct training sessions**
3. **Provide user manual**

### Step 2: Ongoing Maintenance
1. **Regular backups**
2. **Monitor automation logs**
3. **Update pricing and services**
4. **Review and optimize workflows**

## Security Considerations

### Data Protection
- Regular backups of Google Sheets
- Proper access control
- HTTPS for all communications
- Secure webhook URLs

### Privacy Compliance
- Customer data protection
- Consent for communications
- Data retention policies

## Support and Troubleshooting

### Common Issues
1. **Zapier automation failures**
   - Check API limits
   - Verify webhook URLs
   - Review error logs

2. **Glide sync issues**
   - Refresh data connection
   - Check Google Sheets permissions
   - Verify formula syntax

3. **Language display issues**
   - Check encoding settings
   - Verify font support
   - Test RTL layout

### Contact Information
- **System Administrator**: [Your contact information]
- **Technical Support**: [Support channels]
- **Company**: AlghadeerEvents
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722

## Conclusion
This setup guide provides a complete implementation of the AlghadeerEvents Management System. Follow each phase carefully, and test thoroughly before going live. The system provides comprehensive event management with automated reporting and multi-language support specifically designed for hall owners and event managers.