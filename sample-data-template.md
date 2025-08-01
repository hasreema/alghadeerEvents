# Sample Data Template for Al Ghadeer Events

## Events Sheet Sample Data

| EventID | EventName | EventType | EventDate | EventTime | Location | Gender | GuestCount | BasePrice | DJ | DJCost | DJProvider | Cake | CakeCost | CakeProvider | DecorationType | DecorationCost | Status |
|---------|-----------|-----------|-----------|-----------|----------|--------|------------|-----------|----|--------|------------|------|----------|--------------|----------------|----------------|--------|
| EVT-2024-001 | Ahmed & Fatima Wedding | Wedding | 2024-12-15 | 19:00 | Hall Floor 1 | Mixed | 150 | 5000 | TRUE | 800 | Hall | TRUE | 300 | Hall | Customized | 600 | Planned |
| EVT-2024-002 | Sara's Henna | Henna | 2024-12-20 | 18:00 | Garden | Women | 80 | 3000 | FALSE | 0 | | TRUE | 200 | Client | Standard | 500 | Planned |
| EVT-2024-003 | Omar's Graduation | Graduation | 2024-12-25 | 17:00 | Hall Floor 0 | Mixed | 100 | 2500 | TRUE | 600 | Client | FALSE | 0 | | Standard | 400 | Planned |

## EmployeesPayments Sheet Sample Data

| EmployeeID | EventID | EmployeeName | Role | Wage | PaymentStatus | Notes |
|------------|---------|--------------|------|------|---------------|-------|
| EMP-2024-001 | EVT-2024-001 | Mohammed Ali | Waiter | 300 | Paid | Worked 8 hours |
| EMP-2024-002 | EVT-2024-001 | Fatima Hassan | Chef | 500 | Paid | Main chef |
| EMP-2024-003 | EVT-2024-001 | Ahmed Saleh | DJ | 400 | Pending | DJ service |
| EMP-2024-004 | EVT-2024-002 | Sara Omar | Waiter | 250 | Not Paid | Part-time |

## Payments Sheet Sample Data

| PaymentID | EventID | PaymentDate | Amount | PaymentMethod | PaymentStatus | Notes |
|-----------|---------|-------------|--------|---------------|---------------|-------|
| PAY-2024-001 | EVT-2024-001 | 2024-11-15 | 2000 | Bank Transfer | Paid | First installment |
| PAY-2024-002 | EVT-2024-001 | 2024-12-01 | 1500 | Cash | Paid | Second installment |
| PAY-2024-003 | EVT-2024-002 | 2024-11-20 | 3000 | Check | Paid | Full payment |
| PAY-2024-004 | EVT-2024-003 | 2024-12-05 | 1000 | Credit Card | Pending | First payment |

## PriceList Sheet Sample Data

| ItemName | ItemType | EventType | DefaultPrice | Currency | IsActive |
|----------|----------|-----------|--------------|----------|----------|
| Wedding Base Price | Base Price | Wedding | 5000 | ILS | TRUE |
| Henna Base Price | Base Price | Henna | 3000 | ILS | TRUE |
| Engagement Base Price | Base Price | Engagement | 4000 | ILS | TRUE |
| Graduation Base Price | Base Price | Graduation | 2500 | ILS | TRUE |
| DJ Service | DJ | All | 800 | ILS | TRUE |
| Cake Service | Cake | All | 300 | ILS | TRUE |
| Fruits Service | Fruits | All | 200 | ILS | TRUE |
| Nuts Service | Nuts | All | 150 | ILS | TRUE |
| Standard Decoration | Decoration | All | 500 | ILS | TRUE |
| Custom Decoration | Decoration | All | 1000 | ILS | TRUE |

## Reminders Sheet Sample Data

| ReminderID | Title | Description | EventID | ReminderDate | ReminderTime | Assignee | Priority | Status |
|------------|-------|-------------|---------|--------------|--------------|----------|----------|--------|
| REM-2024-001 | Turn off generator | Turn off generator after event ends | EVT-2024-001 | 2024-12-15 | 23:00 | Ahmed | High | Pending |
| REM-2024-002 | Setup tables | Setup tables for henna event | EVT-2024-002 | 2024-12-20 | 16:00 | Mohammed | Medium | Pending |
| REM-2024-003 | Clean venue | Clean venue after graduation | EVT-2024-003 | 2024-12-25 | 22:00 | Fatima | Medium | Pending |

## Tasks Sheet Sample Data

| TaskID | TaskTitle | TaskDescription | EventID | AssignedTo | DueDate | Priority | Status | Category |
|--------|-----------|-----------------|---------|------------|---------|----------|--------|----------|
| TSK-2024-001 | Setup tables | Arrange 20 tables with white tablecloths | EVT-2024-001 | Mohammed | 2024-12-15 | High | Not Started | Setup |
| TSK-2024-002 | Prepare food | Prepare wedding menu items | EVT-2024-001 | Fatima | 2024-12-15 | High | In Progress | Setup |
| TSK-2024-003 | Clean venue | Clean venue after event | EVT-2024-001 | Ahmed | 2024-12-16 | Medium | Not Started | Cleanup |

## Language Sheet Sample Data

| TextID | English | Hebrew | Arabic | Category |
|--------|---------|--------|--------|----------|
| dashboard_title | Dashboard | לוח מחוונים | لوحة التحكم | UI |
| events_title | Events | אירועים | الأحداث | UI |
| payments_title | Payments | תשלומים | المدفوعات | UI |
| employees_title | Employees | עובדים | الموظفين | UI |
| add_event | Add Event | הוסף אירוע | إضافة حدث | UI |
| save | Save | שמור | حفظ | UI |
| cancel | Cancel | בטל | إلغاء | UI |
| monthly_report | Monthly Report | דוח חודשי | تقرير شهري | Reports |
| profitability | Profitability | רווחיות | الربحية | Reports |
| paid | Paid | שולם | مدفوع | UI |
| not_paid | Not Paid | לא שולם | غير مدفوع | UI |