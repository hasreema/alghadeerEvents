# Zapier Automation Setup Guide for Al Ghadeer Events

## Overview
This guide provides step-by-step instructions for setting up Zapier automations to enhance the Event Management System with automated reporting, notifications, and data synchronization.

## Prerequisites
1. Zapier account (free or paid plan)
2. Google Sheets document connected to Glide app
3. Email service (Gmail, Outlook, etc.)
4. WhatsApp Business API access (optional)
5. PDF generation service (Google Docs, DocuSign, etc.)

## Automation Overview

### Core Automations
1. **Monthly Report Generation** - Automatic PDF reports sent on 1st of each month
2. **Payment Reminders** - Automated reminders for unpaid balances
3. **Event Reminders** - Notifications for upcoming events
4. **Task Notifications** - Reminders for due tasks
5. **Data Synchronization** - Keep data consistent across platforms

## Step 1: Monthly Report Automation

### 1.1 Trigger Setup
**Zap Name**: "Monthly Report Generation"

1. **Trigger App**: Schedule by Zapier
   - **Trigger Event**: Every Month
   - **Day of Month**: 1st
   - **Time**: 09:00 AM (local time)

### 1.2 Data Collection
**Step 1**: Google Sheets - Get Many Rows
- **App**: Google Sheets
- **Action**: Get Many Rows
- **Spreadsheet**: Your Events Management Sheet
- **Worksheet**: Events
- **Filter**: EventDate >= First day of previous month AND EventDate <= Last day of previous month

**Step 2**: Google Sheets - Get Many Rows (Payments)
- **App**: Google Sheets
- **Action**: Get Many Rows
- **Spreadsheet**: Your Events Management Sheet
- **Worksheet**: Payments
- **Filter**: PaymentDate >= First day of previous month AND PaymentDate <= Last day of previous month

**Step 3**: Google Sheets - Get Many Rows (Employees)
- **App**: Google Sheets
- **Action**: Get Many Rows
- **Spreadsheet**: Your Events Management Sheet
- **Worksheet**: EmployeesPayments
- **Filter**: CreatedDate >= First day of previous month AND CreatedDate <= Last day of previous month

### 1.3 Data Processing
**Step 4**: Code by Zapier (JavaScript)
```javascript
// Calculate monthly totals
const events = inputData.events || [];
const payments = inputData.payments || [];
const employees = inputData.employees || [];

// Calculate totals
let totalRevenue = 0;
let totalExpenses = 0;
let totalProfit = 0;
let totalEvents = events.length;
let totalPayments = payments.length;
let totalLaborCost = 0;

// Calculate revenue
payments.forEach(payment => {
  if (payment.PaymentStatus === 'Paid') {
    totalRevenue += parseFloat(payment.Amount) || 0;
  }
});

// Calculate expenses and profit
events.forEach(event => {
  totalExpenses += parseFloat(event.TotalEventCost) || 0;
  totalProfit += parseFloat(event.NetProfit) || 0;
});

// Calculate labor costs
employees.forEach(employee => {
  totalLaborCost += parseFloat(employee.Wage) || 0;
});

// Prepare report data
const reportData = {
  month: new Date().toLocaleString('he-IL', { month: 'long', year: 'numeric' }),
  totalRevenue: totalRevenue.toFixed(2),
  totalExpenses: totalExpenses.toFixed(2),
  totalProfit: totalProfit.toFixed(2),
  totalEvents: totalEvents,
  totalPayments: totalPayments,
  totalLaborCost: totalLaborCost.toFixed(2),
  events: events,
  payments: payments,
  employees: employees
};

return { reportData };
```

### 1.4 PDF Generation
**Step 5**: Google Docs - Create Document from Template
- **App**: Google Docs
- **Action**: Create Document from Template
- **Template**: Monthly Report Template (create this in Google Docs)
- **Document Name**: `דוח חודשי - ${month}`
- **Variables to Map**:
  - `{{month}}`: Report month
  - `{{totalRevenue}}`: Total revenue
  - `{{totalExpenses}}`: Total expenses
  - `{{totalProfit}}`: Total profit
  - `{{totalEvents}}`: Number of events
  - `{{totalPayments}}`: Number of payments
  - `{{totalLaborCost}}`: Total labor cost

### 1.5 PDF Conversion
**Step 6**: Google Docs - Convert to PDF
- **App**: Google Docs
- **Action**: Convert to PDF
- **Document**: Output from previous step
- **File Name**: `דוח_חודשי_${month}.pdf`

### 1.6 Email Notification
**Step 7**: Gmail - Send Email
- **App**: Gmail
- **Action**: Send Email
- **To**: alghadeerevents@gmail.com
- **Subject**: `דוח חודשי - ${month}`
- **Body**:
```
שלום,

בצירוף דוח חודשי עבור ${month}.

סיכום:
- הכנסות: ₪${totalRevenue}
- הוצאות: ₪${totalExpenses}
- רווח: ₪${totalProfit}
- מספר אירועים: ${totalEvents}
- מספר תשלומים: ${totalPayments}
- עלות עבודה: ₪${totalLaborCost}

בברכה,
מערכת ניהול אירועים - قاعات الغدير
```

- **Attachments**: PDF from previous step

### 1.7 WhatsApp Notification (Optional)
**Step 8**: WhatsApp Business API - Send Message
- **App**: WhatsApp Business API
- **Action**: Send Message
- **To**: +970595781722
- **Message**:
```
דוח חודשי - ${month}

סיכום:
- הכנסות: ₪${totalRevenue}
- הוצאות: ₪${totalExpenses}
- רווח: ₪${totalProfit}
- מספר אירועים: ${totalEvents}

הדוח המלא נשלח למייל.
```

## Step 2: Payment Reminder Automation

### 2.1 Trigger Setup
**Zap Name**: "Payment Reminders"

1. **Trigger App**: Schedule by Zapier
   - **Trigger Event**: Every Day
   - **Time**: 10:00 AM

### 2.2 Data Collection
**Step 1**: Google Sheets - Get Many Rows
- **App**: Google Sheets
- **Action**: Get Many Rows
- **Spreadsheet**: Your Events Management Sheet
- **Worksheet**: Events
- **Filter**: PaymentStatus = "Not Paid" OR PaymentStatus = "Partially Paid"

### 2.3 Reminder Logic
**Step 2**: Code by Zapier (JavaScript)
```javascript
const events = inputData.events || [];
const today = new Date();
const reminders = [];

events.forEach(event => {
  const eventDate = new Date(event.EventDate);
  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  // Send reminder if event is within 7 days and payment is not complete
  if (daysUntilEvent <= 7 && daysUntilEvent > 0) {
    const outstandingAmount = parseFloat(event.TotalEventCost) - parseFloat(event.TotalIncome);
    
    if (outstandingAmount > 0) {
      reminders.push({
        eventName: event.EventName,
        eventDate: event.EventDate,
        outstandingAmount: outstandingAmount.toFixed(2),
        daysUntilEvent: daysUntilEvent
      });
    }
  }
});

return { reminders };
```

### 2.4 Email Reminders
**Step 3**: Gmail - Send Email (for each reminder)
- **App**: Gmail
- **Action**: Send Email
- **To**: alghadeerevents@gmail.com
- **Subject**: `תזכורת תשלום - ${eventName}`
- **Body**:
```
תזכורת תשלום

אירוע: ${eventName}
תאריך: ${eventDate}
סכום לתשלום: ₪${outstandingAmount}
ימים עד האירוע: ${daysUntilEvent}

אנא בדוק את סטטוס התשלום.
```

## Step 3: Event Reminder Automation

### 3.1 Trigger Setup
**Zap Name**: "Event Reminders"

1. **Trigger App**: Schedule by Zapier
   - **Trigger Event**: Every Day
   - **Time**: 08:00 AM

### 3.2 Data Collection
**Step 1**: Google Sheets - Get Many Rows
- **App**: Google Sheets
- **Action**: Get Many Rows
- **Spreadsheet**: Your Events Management Sheet
- **Worksheet**: Events
- **Filter**: EventDate = Today AND Status = "Planned"

### 3.3 Notification Setup
**Step 2**: Gmail - Send Email
- **App**: Gmail
- **Action**: Send Email
- **To**: alghadeerevents@gmail.com
- **Subject**: `אירוע היום - ${eventName}`
- **Body**:
```
אירוע היום

שם האירוע: ${eventName}
סוג: ${eventType}
מיקום: ${location}
שעה: ${eventTime}
מספר אורחים: ${guestCount}

בהצלחה!
```

## Step 4: Task Reminder Automation

### 4.1 Trigger Setup
**Zap Name**: "Task Reminders"

1. **Trigger App**: Schedule by Zapier
   - **Trigger Event**: Every Hour

### 4.2 Data Collection
**Step 1**: Google Sheets - Get Many Rows
- **App**: Google Sheets
- **Action**: Get Many Rows
- **Spreadsheet**: Your Events Management Sheet
- **Worksheet**: Tasks
- **Filter**: DueDate = Today AND Status = "Not Started" OR Status = "In Progress"

### 4.3 Notification Setup
**Step 2**: Gmail - Send Email
- **App**: Gmail
- **Action**: Send Email
- **To**: alghadeerevents@gmail.com
- **Subject**: `משימה לתשומת לב - ${taskTitle}`
- **Body**:
```
משימה לתשומת לב

כותרת: ${taskTitle}
תיאור: ${taskDescription}
מוקצה ל: ${assignedTo}
עדיפות: ${priority}
קטגוריה: ${category}

אנא בדוק את המשימה.
```

## Step 5: Data Synchronization Automation

### 5.1 Backup Automation
**Zap Name**: "Daily Data Backup"

1. **Trigger App**: Schedule by Zapier
   - **Trigger Event**: Every Day
   - **Time**: 02:00 AM

2. **Step 1**: Google Sheets - Get Many Rows (All sheets)
3. **Step 2**: Google Drive - Upload File
   - Create backup CSV files
   - Store in dedicated backup folder

### 5.2 Data Validation
**Zap Name**: "Data Validation"

1. **Trigger App**: Schedule by Zapier
   - **Trigger Event**: Every Week
   - **Day**: Sunday
   - **Time**: 06:00 AM

2. **Step 1**: Google Sheets - Get Many Rows
3. **Step 2**: Code by Zapier - Validate data integrity
4. **Step 3**: Gmail - Send validation report

## Step 6: Advanced Automations

### 6.1 Profitability Alerts
**Zap Name**: "Profitability Alerts"

1. **Trigger App**: Google Sheets
   - **Trigger Event**: New Row
   - **Worksheet**: Events

2. **Step 1**: Code by Zapier - Check profitability
3. **Step 2**: Gmail - Send alert if profit < 0

### 6.2 Employee Payment Tracking
**Zap Name**: "Employee Payment Tracking"

1. **Trigger App**: Google Sheets
   - **Trigger Event**: New Row
   - **Worksheet**: EmployeesPayments

2. **Step 1**: Code by Zapier - Calculate total wages
3. **Step 2**: Gmail - Send payment summary

## Step 7: Manual Report Trigger

### 7.1 Webhook Setup
**Zap Name**: "Manual Report Generation"

1. **Trigger App**: Webhooks by Zapier
   - **Trigger Event**: Catch Hook
   - **URL**: Generated webhook URL

2. **Steps**: Same as Monthly Report (Steps 1.2 - 1.7)

### 7.2 Integration with Glide
- Add "Send Report Now" button in Glide dashboard
- Button triggers webhook
- Webhook triggers report generation

## Step 8: Testing and Monitoring

### 8.1 Test Each Automation
1. **Manual Testing**:
   - Run each zap manually
   - Verify outputs
   - Check email delivery
   - Validate PDF generation

2. **Scheduled Testing**:
   - Monitor zap history
   - Check success rates
   - Review error logs

### 8.2 Error Handling
1. **Retry Logic**: Configure retry attempts for failed zaps
2. **Error Notifications**: Send alerts for failed automations
3. **Fallback Actions**: Alternative actions when primary fails

## Step 9: Optimization and Maintenance

### 9.1 Performance Optimization
1. **Batch Processing**: Group similar operations
2. **Rate Limiting**: Respect API limits
3. **Data Filtering**: Only process relevant data

### 9.2 Regular Maintenance
1. **Monthly Review**: Check zap performance
2. **Update Templates**: Refresh email and PDF templates
3. **Monitor Costs**: Track Zapier usage and costs

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Re-authenticate apps
2. **Data Format Issues**: Check column names and data types
3. **Rate Limiting**: Implement delays between actions
4. **File Size Limits**: Compress large files

### Support Resources
- Zapier Help Center
- Google Sheets API documentation
- Gmail API documentation
- WhatsApp Business API documentation

## Cost Considerations

### Zapier Pricing
- **Free Plan**: 100 tasks/month, 5 zaps
- **Starter Plan**: 750 tasks/month, 20 zaps ($19.99/month)
- **Professional Plan**: 2,000 tasks/month, unlimited zaps ($49/month)

### Estimated Monthly Tasks
- Monthly Report: ~50 tasks
- Daily Reminders: ~30 tasks/day = 900 tasks/month
- Hourly Checks: ~24 tasks/day = 720 tasks/month
- **Total**: ~1,670 tasks/month

**Recommendation**: Professional Plan for full automation

---

**Note**: This automation setup assumes you have the necessary API access and permissions. Some features (like WhatsApp Business API) may require additional setup and approval processes.