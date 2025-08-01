# Google Sheets Structure for Al Ghadeer Events Management System

## Overview
This document defines the structure for all Google Sheets that will serve as the database for the Event Management System. Each sheet contains specific columns and data types to support the system's functionality.

## 1. Events Sheet

### Purpose
Main table for storing all event information, pricing, and profitability calculations.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| EventID | Auto-generated | Unique identifier for each event | Yes | EVT-2024-001 |
| EventName | Text | Name of the event | Yes | "Ahmed & Fatima Wedding" |
| EventType | Dropdown | Type of event | Yes | Wedding, Henna, Engagement, Graduation, Other |
| EventTypeOther | Text | Custom event type (if "Other" selected) | No | "Corporate Meeting" |
| EventDate | Date | Date of the event | Yes | 2024-12-15 |
| EventTime | Time | Time of the event | Yes | 19:00 |
| Location | Dropdown | Event location | Yes | Hall Floor 0, Hall Floor 1, Garden, Waterfall |
| Gender | Dropdown | Gender specification | Yes | Men, Women, Mixed |
| GuestCount | Number | Number of guests | Yes | 150 |
| BasePrice | Currency (ILS) | Base price for the event | Yes | 5000 |
| DJ | Checkbox | DJ service requested | No | TRUE/FALSE |
| DJCost | Currency (ILS) | Cost of DJ service | No | 800 |
| DJProvider | Dropdown | Who provides DJ | No | Hall, Client |
| Cake | Checkbox | Cake service requested | No | TRUE/FALSE |
| CakeQuantity | Number | Number of cakes | No | 2 |
| CakeCost | Currency (ILS) | Cost of cake service | No | 300 |
| CakeProvider | Dropdown | Who provides cake | No | Hall, Client |
| Fruits | Checkbox | Fruits service requested | No | TRUE/FALSE |
| FruitsCost | Currency (ILS) | Cost of fruits | No | 200 |
| FruitsProvider | Dropdown | Who provides fruits | No | Hall, Client |
| Nuts | Checkbox | Nuts service requested | No | TRUE/FALSE |
| NutsCost | Currency (ILS) | Cost of nuts | No | 150 |
| NutsProvider | Dropdown | Who provides nuts | No | Hall, Client |
| OtherRequests | Checkbox | Other custom requests | No | TRUE/FALSE |
| OtherRequestsDescription | Text | Description of other requests | No | "Special lighting setup" |
| OtherRequestsCost | Currency (ILS) | Cost of other requests | No | 400 |
| OtherRequestsProvider | Dropdown | Who provides other requests | No | Hall, Client |
| DecorationType | Dropdown | Type of decoration | Yes | Standard, Customized |
| DecorationDescription | Text | Description of decoration (if customized) | No | "Gold and white theme" |
| DecorationCost | Currency (ILS) | Cost of decoration | Yes | 600 |
| TotalExtrasCost | Currency (ILS) | Total cost of all extras | Auto-calculated | 2450 |
| TotalEventCost | Currency (ILS) | Total cost of event | Auto-calculated | 7450 |
| TotalLaborCost | Currency (ILS) | Total labor cost (from EmployeesPayments) | Auto-calculated | 1200 |
| TotalIncome | Currency (ILS) | Total income from payments | Auto-calculated | 6000 |
| NetProfit | Currency (ILS) | Net profit calculation | Auto-calculated | -2650 |
| ProfitabilityPercentage | Percentage | Profitability percentage | Auto-calculated | -35.6% |
| ProfitabilityStatus | Dropdown | Profitability indicator | Auto-calculated | Green, Yellow, Red |
| Notes | Text | Additional notes | No | "Client requested early setup" |
| Status | Dropdown | Event status | Yes | Planned, In Progress, Completed, Cancelled |
| CreatedDate | Date | Date record was created | Auto | 2024-11-01 |
| LastModified | Date | Last modification date | Auto | 2024-11-15 |

## 2. EmployeesPayments Sheet

### Purpose
Track employees, their roles, wages, and payments for each event.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| EmployeeID | Auto-generated | Unique identifier for each employee record | Yes | EMP-2024-001 |
| EventID | Reference | Reference to Events sheet | Yes | EVT-2024-001 |
| EmployeeName | Text | Name of the employee | Yes | "Mohammed Ali" |
| Role | Dropdown | Employee role | Yes | Waiter, Chef, DJ, Cleaner, Manager, Other |
| RoleOther | Text | Custom role (if "Other" selected) | No | "Security Guard" |
| Wage | Currency (ILS) | Wage for this event | Yes | 300 |
| PaymentDate | Date | Date of payment | No | 2024-12-16 |
| PaymentStatus | Dropdown | Payment status | Yes | Paid, Pending, Not Paid |
| Notes | Text | Additional notes about employee | No | "Worked extra 2 hours" |
| CreatedDate | Date | Date record was created | Auto | 2024-11-01 |

## 3. PriceList Sheet

### Purpose
Default pricing for different services and items.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| ItemID | Auto-generated | Unique identifier for each item | Yes | ITM-001 |
| ItemName | Text | Name of the item/service | Yes | "Wedding Base Price" |
| ItemType | Dropdown | Type of item | Yes | Base Price, DJ, Cake, Fruits, Nuts, Decoration |
| EventType | Dropdown | Applicable event type | Yes | Wedding, Henna, Engagement, Graduation, Other, All |
| DefaultPrice | Currency (ILS) | Default price | Yes | 5000 |
| Currency | Text | Currency code | Yes | ILS |
| IsActive | Checkbox | Whether item is active | Yes | TRUE |
| Description | Text | Description of the item | No | "Standard wedding package" |
| CreatedDate | Date | Date record was created | Auto | 2024-11-01 |

## 4. Payments Sheet

### Purpose
Track all payments, receipts, and outstanding balances for events.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| PaymentID | Auto-generated | Unique identifier for each payment | Yes | PAY-2024-001 |
| EventID | Reference | Reference to Events sheet | Yes | EVT-2024-001 |
| PaymentDate | Date | Date of payment | Yes | 2024-11-15 |
| Amount | Currency (ILS) | Payment amount | Yes | 2000 |
| PaymentMethod | Dropdown | Method of payment | Yes | Cash, Bank Transfer, Check, Credit Card |
| PaymentStatus | Dropdown | Status of payment | Yes | Paid, Pending, Failed |
| ReceiptFile | File | Uploaded receipt (image/PDF) | No | receipt_001.pdf |
| ReceiptURL | URL | Link to receipt file | Auto | https://drive.google.com/... |
| Notes | Text | Additional notes about payment | No | "First installment" |
| CreatedDate | Date | Date record was created | Auto | 2024-11-15 |

## 5. Reminders Sheet

### Purpose
Manage one-time and recurring reminders for events and tasks.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| ReminderID | Auto-generated | Unique identifier for each reminder | Yes | REM-2024-001 |
| Title | Text | Reminder title | Yes | "Turn off generator" |
| Description | Text | Detailed description | Yes | "Remember to turn off generator after event ends" |
| EventID | Reference | Related event (optional) | No | EVT-2024-001 |
| ReminderDate | Date | Date of reminder | Yes | 2024-12-15 |
| ReminderTime | Time | Time of reminder | Yes | 23:00 |
| Assignee | Text | Person assigned to reminder | No | "Ahmed" |
| IsRecurring | Checkbox | Whether reminder is recurring | Yes | FALSE |
| RecurrencePattern | Dropdown | Recurrence pattern (if recurring) | No | Daily, Weekly, Monthly |
| Status | Dropdown | Reminder status | Yes | Pending, Completed, Cancelled |
| Priority | Dropdown | Priority level | Yes | Low, Medium, High, Critical |
| CreatedDate | Date | Date record was created | Auto | 2024-11-01 |

## 6. Contacts Sheet

### Purpose
Store additional contacts related to events.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| ContactID | Auto-generated | Unique identifier for each contact | Yes | CON-2024-001 |
| EventID | Reference | Related event | No | EVT-2024-001 |
| ContactName | Text | Name of contact | Yes | "Fatima's Father" |
| ContactType | Dropdown | Type of contact | Yes | Client, Vendor, Emergency, Other |
| PhoneNumber | Text | Phone number | No | +970595781722 |
| Email | Email | Email address | No | contact@example.com |
| Notes | Text | Additional notes | No | "Main contact for wedding" |
| CreatedDate | Date | Date record was created | Auto | 2024-11-01 |

## 7. Tasks Sheet

### Purpose
Manage team tasks and operational actions.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| TaskID | Auto-generated | Unique identifier for each task | Yes | TSK-2024-001 |
| TaskTitle | Text | Task title | Yes | "Setup tables for wedding" |
| TaskDescription | Text | Detailed task description | Yes | "Arrange 20 tables with white tablecloths" |
| EventID | Reference | Related event | No | EVT-2024-001 |
| AssignedTo | Text | Person assigned to task | No | "Mohammed" |
| DueDate | Date | Due date for task | Yes | 2024-12-15 |
| DueTime | Time | Due time for task | No | 16:00 |
| Priority | Dropdown | Task priority | Yes | Low, Medium, High, Critical |
| Status | Dropdown | Task status | Yes | Not Started, In Progress, Completed, Cancelled |
| Category | Dropdown | Task category | Yes | Setup, Cleanup, Maintenance, Administrative |
| Notes | Text | Additional notes | No | "Need extra chairs" |
| CreatedDate | Date | Date record was created | Auto | 2024-11-01 |

## 8. Language Sheet

### Purpose
Store multi-language text for UI elements.

### Columns Structure
| Column Name | Data Type | Description | Required | Example |
|-------------|-----------|-------------|----------|---------|
| TextID | Text | Unique identifier for text element | Yes | "dashboard_title" |
| English | Text | English text | Yes | "Dashboard" |
| Hebrew | Text | Hebrew text | Yes | "לוח מחוונים" |
| Arabic | Text | Arabic text | Yes | "لوحة التحكم" |
| Category | Dropdown | Text category | Yes | UI, Reports, Notifications |
| IsActive | Checkbox | Whether text is active | Yes | TRUE |

## Data Validation Rules

### Dropdown Options

#### EventType
- Wedding
- Henna
- Engagement
- Graduation
- Other

#### Location
- Hall Floor 0
- Hall Floor 1
- Garden
- Waterfall

#### Gender
- Men
- Women
- Mixed

#### PaymentStatus (Events)
- Paid
- Partially Paid
- Not Paid

#### EventStatus
- Planned
- In Progress
- Completed
- Cancelled

#### ProfitabilityStatus
- Green (Profit > 0)
- Yellow (Profit = 0)
- Red (Profit < 0)

#### EmployeeRole
- Waiter
- Chef
- DJ
- Cleaner
- Manager
- Other

#### PaymentMethod
- Cash
- Bank Transfer
- Check
- Credit Card

#### ReminderPriority
- Low
- Medium
- High
- Critical

#### TaskPriority
- Low
- Medium
- High
- Critical

## Auto-Calculations

### Events Sheet
- **TotalExtrasCost**: Sum of all extra costs (DJ, Cake, Fruits, Nuts, Other, Decoration)
- **TotalEventCost**: BasePrice + TotalExtrasCost
- **TotalLaborCost**: Sum of all employee wages for this event
- **TotalIncome**: Sum of all payments for this event
- **NetProfit**: TotalIncome - TotalEventCost - TotalLaborCost
- **ProfitabilityPercentage**: (NetProfit / TotalEventCost) * 100
- **ProfitabilityStatus**: 
  - Green if NetProfit > 0
  - Yellow if NetProfit = 0
  - Red if NetProfit < 0

## Sample Data

### PriceList Sample Data
| ItemName | ItemType | EventType | DefaultPrice |
|----------|----------|-----------|--------------|
| Wedding Base Price | Base Price | Wedding | 5000 |
| Henna Base Price | Base Price | Henna | 3000 |
| Engagement Base Price | Base Price | Engagement | 4000 |
| Graduation Base Price | Base Price | Graduation | 2500 |
| DJ Service | DJ | All | 800 |
| Cake Service | Cake | All | 300 |
| Fruits Service | Fruits | All | 200 |
| Nuts Service | Nuts | All | 150 |
| Standard Decoration | Decoration | All | 500 |
| Custom Decoration | Decoration | All | 1000 |

### Language Sample Data
| TextID | English | Hebrew | Arabic |
|--------|---------|--------|--------|
| dashboard_title | Dashboard | לוח מחוונים | لوحة التحكم |
| events_title | Events | אירועים | الأحداث |
| payments_title | Payments | תשלומים | المدفوعات |
| employees_title | Employees | עובדים | الموظفين |
| reminders_title | Reminders | תזכורות | التذكيرات |
| tasks_title | Tasks | משימות | المهام |
| add_event | Add Event | הוסף אירוע | إضافة حدث |
| edit_event | Edit Event | ערוך אירוע | تعديل حدث |
| delete_event | Delete Event | מחק אירוע | حذف حدث |
| save | Save | שמור | حفظ |
| cancel | Cancel | בטל | إلغاء |
| search | Search | חיפוש | بحث |
| filter | Filter | סינון | تصفية |
| export | Export | ייצוא | تصدير |
| print | Print | הדפסה | طباعة |
| send_report | Send Report | שלח דוח | إرسال تقرير |
| monthly_report | Monthly Report | דוח חודשי | تقرير شهري |
| profitability | Profitability | רווחיות | الربحية |
| revenue | Revenue | הכנסות | الإيرادات |
| expenses | Expenses | הוצאות | المصروفات |
| profit | Profit | רווח | الربح |
| loss | Loss | הפסד | الخسارة |
| paid | Paid | שולם | مدفوع |
| partially_paid | Partially Paid | שולם חלקית | مدفوع جزئياً |
| not_paid | Not Paid | לא שולם | غير مدفوع |
| pending | Pending | בהמתנה | معلق |
| completed | Completed | הושלם | مكتمل |
| cancelled | Cancelled | בוטל | ملغي |
| low | Low | נמוך | منخفض |
| medium | Medium | בינוני | متوسط |
| high | High | גבוה | عالي |
| critical | Critical | קריטי | حرج |