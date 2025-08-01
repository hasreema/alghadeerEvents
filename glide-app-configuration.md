# Glide App Configuration Guide for Al Ghadeer Events

## Overview
This guide provides step-by-step instructions for setting up the Event Management System in Glide Apps, including tab configuration, data relationships, and UI customization.

## Prerequisites
1. Google Sheets document with the structure defined in `google-sheets-structure.md`
2. Glide Apps account (free or paid)
3. Basic understanding of Glide interface

## Step 1: Create New Glide Project

### 1.1 Initial Setup
1. Go to [Glide Apps](https://glideapps.com) and sign in
2. Click "Create New App"
3. Select "Google Sheets" as your data source
4. Connect your Google Sheets document
5. Name your app: "Al Ghadeer Events Management"

### 1.2 Data Source Configuration
1. In the data tab, verify all sheets are properly connected:
   - Events
   - EmployeesPayments
   - PriceList
   - Payments
   - Reminders
   - Contacts
   - Tasks
   - Language

2. Set up relationships between sheets:
   - Events ↔ EmployeesPayments (via EventID)
   - Events ↔ Payments (via EventID)
   - Events ↔ Reminders (via EventID)
   - Events ↔ Contacts (via EventID)
   - Events ↔ Tasks (via EventID)

## Step 2: Configure Tabs

### 2.1 Dashboard Tab

#### Purpose
Main overview with profitability meter, charts, and quick actions.

#### Configuration
1. **Tab Settings**
   - Name: "Dashboard"
   - Icon: 📊
   - Layout: List

2. **Components to Add**

   **A. Profitability Meter**
   - Component: Custom Component
   - Data Source: Events (filtered by current month)
   - Display: Circular progress indicator
   - Colors: Green (>0), Yellow (=0), Red (<0)

   **B. Revenue vs Expenses Chart**
   - Component: Chart
   - Type: Bar Chart
   - Data: Monthly revenue vs expenses
   - X-axis: Months
   - Y-axis: Amount (ILS)

   **C. Upcoming Events**
   - Component: List
   - Data Source: Events
   - Filter: EventDate >= Today
   - Sort: EventDate (ascending)
   - Display: Event name, date, location, status

   **D. Outstanding Balances**
   - Component: List
   - Data Source: Events
   - Filter: PaymentStatus = "Not Paid" OR "Partially Paid"
   - Display: Event name, outstanding amount, due date

   **E. Quick Actions**
   - Component: Button Group
   - Actions:
     - "Add New Event"
     - "Send Monthly Report"
     - "View All Events"
     - "View All Payments"

3. **Layout Structure**
   ```
   ┌─────────────────────────────────────┐
   │           Profitability Meter       │
   ├─────────────────────────────────────┤
   │        Revenue vs Expenses          │
   ├─────────────────────────────────────┤
   │         Upcoming Events             │
   ├─────────────────────────────────────┤
   │       Outstanding Balances          │
   ├─────────────────────────────────────┤
   │          Quick Actions              │
   └─────────────────────────────────────┘
   ```

### 2.2 Events Tab

#### Purpose
Manage all events with detailed information and profitability tracking.

#### Configuration
1. **Tab Settings**
   - Name: "Events"
   - Icon: 🎉
   - Layout: List

2. **List Configuration**
   - **Display Fields**:
     - EventName (Title)
     - EventDate (Subtitle)
     - Location (Badge)
     - ProfitabilityStatus (Color-coded badge)
     - TotalEventCost (Right-aligned)

   - **Actions**:
     - View Details
     - Edit Event
     - Delete Event
     - Add Payment
     - Add Employee

3. **Detail View Configuration**
   - **Header Section**:
     - Event name (large text)
     - Event type and date
     - Location and guest count
     - Status badge

   - **Pricing Section**:
     - Base price
     - Extras breakdown (DJ, Cake, Fruits, Nuts, Other)
     - Decoration details
     - Total event cost

   - **Financial Section**:
     - Total income
     - Total labor cost
     - Net profit
     - Profitability percentage
     - Profitability status indicator

   - **Additional Information**:
     - Notes
     - Created/modified dates

4. **Add/Edit Form Configuration**
   - **Event Details Section**:
     ```
     Event Name* (Text Input)
     Event Type* (Dropdown: Wedding, Henna, Engagement, Graduation, Other)
     Event Type Other (Text Input - shown when "Other" selected)
     Event Date* (Date Picker)
     Event Time* (Time Picker)
     Location* (Dropdown: Hall Floor 0, Hall Floor 1, Garden, Waterfall)
     Gender* (Dropdown: Men, Women, Mixed)
     Guest Count* (Number Input)
     ```

   - **Pricing Section**:
     ```
     Base Price* (Currency Input - ILS)
     ```

   - **Additional Services Section**:
     ```
     DJ (Checkbox)
     DJ Cost (Currency Input - shown when DJ checked)
     DJ Provider (Dropdown: Hall, Client - shown when DJ checked)
     
     Cake (Checkbox)
     Cake Quantity (Number Input - shown when Cake checked)
     Cake Cost (Currency Input - shown when Cake checked)
     Cake Provider (Dropdown: Hall, Client - shown when Cake checked)
     
     Fruits (Checkbox)
     Fruits Cost (Currency Input - shown when Fruits checked)
     Fruits Provider (Dropdown: Hall, Client - shown when Fruits checked)
     
     Nuts (Checkbox)
     Nuts Cost (Currency Input - shown when Nuts checked)
     Nuts Provider (Dropdown: Hall, Client - shown when Nuts checked)
     
     Other Requests (Checkbox)
     Other Requests Description (Text Input - shown when Other checked)
     Other Requests Cost (Currency Input - shown when Other checked)
     Other Requests Provider (Dropdown: Hall, Client - shown when Other checked)
     ```

   - **Decoration Section**:
     ```
     Decoration Type* (Dropdown: Standard, Customized)
     Decoration Description (Text Input - shown when Customized selected)
     Decoration Cost* (Currency Input)
     ```

   - **Additional Information**:
     ```
     Notes (Text Area)
     Status* (Dropdown: Planned, In Progress, Completed, Cancelled)
     ```

5. **Filters and Search**
   - Search by event name
   - Filter by event type
   - Filter by location
   - Filter by date range
   - Filter by profitability status
   - Filter by payment status

### 2.3 Payments Tab

#### Purpose
Track all payments, receipts, and outstanding balances.

#### Configuration
1. **Tab Settings**
   - Name: "Payments"
   - Icon: 💰
   - Layout: List

2. **List Configuration**
   - **Display Fields**:
     - EventName (Title - from Events relationship)
     - PaymentDate (Subtitle)
     - Amount (Right-aligned, large text)
     - PaymentMethod (Badge)
     - PaymentStatus (Color-coded badge)

   - **Actions**:
     - View Details
     - Edit Payment
     - Delete Payment
     - View Receipt

3. **Detail View Configuration**
   - **Header Section**:
     - Event name (from relationship)
     - Payment date and amount
     - Payment method and status

   - **Receipt Section**:
     - Receipt image/PDF viewer
     - Download receipt button

   - **Additional Information**:
     - Notes
     - Created date

4. **Add/Edit Form Configuration**
   ```
   Event* (Relationship picker - Events)
   Payment Date* (Date Picker)
   Amount* (Currency Input - ILS)
   Payment Method* (Dropdown: Cash, Bank Transfer, Check, Credit Card)
   Payment Status* (Dropdown: Paid, Pending, Failed)
   Receipt File (File Upload - Images/PDF)
   Notes (Text Area)
   ```

5. **Summary Section**
   - Total payments this month
   - Outstanding balances
   - Payment methods breakdown

### 2.4 Employees Tab

#### Purpose
Manage employees, roles, wages, and payments for events.

#### Configuration
1. **Tab Settings**
   - Name: "Employees"
   - Icon: 👥
   - Layout: List

2. **List Configuration**
   - **Display Fields**:
     - EmployeeName (Title)
     - EventName (Subtitle - from Events relationship)
     - Role (Badge)
     - Wage (Right-aligned)
     - PaymentStatus (Color-coded badge)

   - **Actions**:
     - View Details
     - Edit Employee
     - Delete Employee
     - Mark as Paid

3. **Add/Edit Form Configuration**
   ```
   Event* (Relationship picker - Events)
   Employee Name* (Text Input)
   Role* (Dropdown: Waiter, Chef, DJ, Cleaner, Manager, Other)
   Role Other (Text Input - shown when "Other" selected)
   Wage* (Currency Input - ILS)
   Payment Date (Date Picker)
   Payment Status* (Dropdown: Paid, Pending, Not Paid)
   Notes (Text Area)
   ```

4. **Summary Section**
   - Total employees this month
   - Total labor cost
   - Unpaid wages

### 2.5 Reminders Tab

#### Purpose
Manage one-time and recurring reminders for events and tasks.

#### Configuration
1. **Tab Settings**
   - Name: "Reminders"
   - Icon: ⏰
   - Layout: List

2. **List Configuration**
   - **Display Fields**:
     - Title (Title)
     - ReminderDate (Subtitle)
     - Priority (Color-coded badge)
     - Status (Badge)
     - Assignee (Small text)

   - **Actions**:
     - View Details
     - Edit Reminder
     - Delete Reminder
     - Mark as Completed

3. **Add/Edit Form Configuration**
   ```
   Title* (Text Input)
   Description* (Text Area)
   Event (Relationship picker - Events)
   Reminder Date* (Date Picker)
   Reminder Time* (Time Picker)
   Assignee (Text Input)
   Is Recurring (Checkbox)
   Recurrence Pattern (Dropdown: Daily, Weekly, Monthly - shown when recurring)
   Priority* (Dropdown: Low, Medium, High, Critical)
   Status* (Dropdown: Pending, Completed, Cancelled)
   ```

4. **Filters**
   - Filter by priority
   - Filter by status
   - Filter by assignee
   - Filter by date range

### 2.6 Tasks Tab

#### Purpose
Manage team tasks and operational actions.

#### Configuration
1. **Tab Settings**
   - Name: "Tasks"
   - Icon: ✅
   - Layout: List

2. **List Configuration**
   - **Display Fields**:
     - TaskTitle (Title)
     - DueDate (Subtitle)
     - Priority (Color-coded badge)
     - Status (Badge)
     - AssignedTo (Small text)

   - **Actions**:
     - View Details
     - Edit Task
     - Delete Task
     - Mark as Completed

3. **Add/Edit Form Configuration**
   ```
   Task Title* (Text Input)
   Task Description* (Text Area)
   Event (Relationship picker - Events)
   Assigned To (Text Input)
   Due Date* (Date Picker)
   Due Time (Time Picker)
   Priority* (Dropdown: Low, Medium, High, Critical)
   Status* (Dropdown: Not Started, In Progress, Completed, Cancelled)
   Category* (Dropdown: Setup, Cleanup, Maintenance, Administrative)
   Notes (Text Area)
   ```

## Step 3: Advanced Features Configuration

### 3.1 Multi-language Support

1. **Language Selection**
   - Add a settings tab or dropdown in header
   - Create language picker component
   - Store selected language in user preferences

2. **Dynamic Text**
   - Use Language sheet as lookup table
   - Create computed columns for UI text
   - Implement language switching logic

### 3.2 Automated Calculations

1. **Events Sheet Calculations**
   - TotalExtrasCost: Sum of all extra costs
   - TotalEventCost: BasePrice + TotalExtrasCost
   - TotalLaborCost: Sum from EmployeesPayments
   - TotalIncome: Sum from Payments
   - NetProfit: TotalIncome - TotalEventCost - TotalLaborCost
   - ProfitabilityPercentage: (NetProfit / TotalEventCost) * 100
   - ProfitabilityStatus: Conditional based on NetProfit

2. **Dashboard Calculations**
   - Monthly revenue and expenses
   - Profitability trends
   - Outstanding balances
   - Upcoming events count

### 3.3 File Upload Configuration

1. **Receipt Upload**
   - Configure file upload component
   - Set allowed file types: Images, PDF
   - Set maximum file size: 10MB
   - Store files in Google Drive
   - Generate shareable URLs

### 3.4 Notifications Setup

1. **Push Notifications**
   - Configure notification settings
   - Set up triggers for:
     - Reminder due dates
     - Payment deadlines
     - Event status changes

2. **Email Notifications**
   - Integrate with email service
   - Set up templates for:
     - Monthly reports
     - Payment reminders
     - Event confirmations

## Step 4: Mobile Optimization

### 4.1 Responsive Design
1. **Layout Adjustments**
   - Use mobile-first design principles
   - Optimize touch targets (minimum 44px)
   - Implement swipe gestures where appropriate

2. **Navigation**
   - Bottom tab navigation for mobile
   - Collapsible side menu for desktop
   - Quick action buttons

### 4.2 Performance Optimization
1. **Data Loading**
   - Implement pagination for large lists
   - Use lazy loading for images
   - Cache frequently accessed data

2. **Offline Capability**
   - Enable offline mode for basic functions
   - Sync data when connection restored
   - Show offline indicator

## Step 5: Testing and Deployment

### 5.1 Testing Checklist
- [ ] All forms work correctly
- [ ] Calculations are accurate
- [ ] File uploads function properly
- [ ] Notifications are sent
- [ ] Multi-language switching works
- [ ] Mobile responsiveness is good
- [ ] Performance is acceptable

### 5.2 Deployment
1. **Publish App**
   - Set app to public or private as needed
   - Configure access permissions
   - Set up user roles if required

2. **Share with Team**
   - Generate share links
   - Set up team access
   - Provide training materials

## Step 6: Maintenance and Updates

### 6.1 Regular Maintenance
- Monitor app performance
- Update data validation rules
- Backup Google Sheets regularly
- Review and update pricing

### 6.2 Feature Updates
- Add new event types as needed
- Update language translations
- Enhance reporting features
- Add new automation workflows

## Troubleshooting

### Common Issues
1. **Data not syncing**: Check Google Sheets permissions
2. **Calculations incorrect**: Verify formula syntax
3. **File uploads failing**: Check file size and type restrictions
4. **Notifications not working**: Verify Zapier integration

### Support Resources
- Glide documentation: https://docs.glideapps.com
- Google Sheets API documentation
- Zapier help center

---

**Note**: This configuration guide assumes you have already set up the Google Sheets structure as defined in the previous document. Make sure all sheets and columns are properly configured before setting up the Glide app.