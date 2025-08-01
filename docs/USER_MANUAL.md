# AlghadeerEvents - User Manual
## دليل المستخدم - ガイد الكامل لنظام إدارة الفعاليات

### Overview / نظرة عامة
This user manual provides comprehensive instructions for using the AlghadeerEvents Management System. The system is designed for hall owners to manage events, payments, employees, and generate automated reports.

يوفر هذا الدليل تعليمات شاملة لاستخدام نظام إدارة فعاليات الغدير. النظام مصمم لأصحاب القاعات لإدارة الفعاليات والمدفوعات والموظفين وإنتاج التقارير التلقائية.

---

## Getting Started / البداية

### 1. Accessing the System / الوصول للنظام
- **App URL**: [Your Glide app URL]
- **Login**: Use your authorized account
- **Languages**: English (default), Arabic, Hebrew

### 2. Main Navigation / التنقل الرئيسي
The app contains 6 main sections:

1. **Dashboard / لوحة التحكم** - Overview and analytics
2. **Events / الفعاليات** - Event management
3. **Payments / المدفوعات** - Payment tracking
4. **Employees / الموظفون** - Staff management
5. **Reminders / التذكيرات** - Task reminders
6. **Tasks / المهام** - Operational tasks

---

## Dashboard / لوحة التحكم

### Features / المميزات
- **Profitability Meter** / مقياس الربحية: Shows overall profitability (Green/Yellow/Red)
- **Revenue Chart** / مخطط الإيرادات: Visual representation of income vs expenses
- **Upcoming Events** / الفعاليات القادمة: Next 5 scheduled events
- **Outstanding Payments** / المدفوعات المتأخرة: Unpaid balances requiring attention
- **Send Report Button** / زر إرسال التقرير: Generate manual monthly report

### How to Use / كيفية الاستخدام
1. **View Profitability**: Check the color-coded meter for business health
2. **Monitor Upcoming Events**: Review scheduled events and prepare accordingly
3. **Track Outstanding Payments**: Follow up with clients for pending payments
4. **Generate Reports**: Use "Send Report" button for immediate report generation

---

## Events Management / إدارة الفعاليات

### Adding a New Event / إضافة فعالية جديدة

#### Step 1: Basic Information / المعلومات الأساسية
1. **Event Name** / اسم الفعالية: Enter descriptive event name
2. **Event Type** / نوع الفعالية: 
   - Wedding / زفاف
   - Henna / حناء  
   - Engagement / خطوبة
   - Graduation / تخرج
   - Other / أخرى (free text if selected)

3. **Event Date** / تاريخ الفعالية: Select from calendar
4. **Time** / الوقت: Set start and end times
5. **Location** / الموقع:
   - Hall Floor 0 / قاعة الطابق الأرضي
   - Hall Floor 1 / قاعة الطابق الأول
   - Garden / الحديقة
   - Waterfall / الشلال

6. **Gender** / الجنس: Men/Women/Mixed / رجال/نساء/مختلط
7. **Guest Count** / عدد الضيوف: Number of expected guests

#### Step 2: Pricing / التسعير
- **Base Price** / السعر الأساسي: Automatically calculated based on location and event type
- **Total Price** / السعر الإجمالي: Updates automatically when services are added

#### Step 3: Additional Services / الخدمات الإضافية
Select services using checkboxes:

1. **DJ Service** / خدمة دي جي:
   - Check box to include
   - Cost field appears when selected
   - Provider: Hall or Client

2. **Cake** / الكعك:
   - Check to include
   - Quantity field (number of cakes)
   - Cost per cake
   - Provider: Hall or Client

3. **Fruits** / الفواكه:
   - Check to include  
   - Standard cost applies
   - Provider: Hall or Client

4. **Nuts** / المكسرات:
   - Check to include
   - Standard cost applies
   - Provider: Hall or Client

5. **Decoration** / الديكور:
   - Standard decoration (checkbox)
   - Custom decoration (free text description)
   - Cost field for custom decorations

#### Step 4: Notes / الملاحظات
- **Free text area** for special requirements
- **Dietary restrictions** / قيود غذائية
- **Special arrangements** / ترتيبات خاصة
- **Client preferences** / تفضيلات العميل

### Editing Events / تعديل الفعاليات
1. Find event in the events list
2. Tap to open event details
3. Use edit button to modify information
4. Save changes

### Event Status Tracking / تتبع حالة الفعالية
- **Upcoming** / قادمة: Future events
- **In Progress** / قيد التنفيذ: Events happening today
- **Completed** / مكتملة: Past events
- **Cancelled** / ملغية: Cancelled events

---

## Payments Management / إدارة المدفوعات

### Payment Status / حالة الدفع
- **Paid** / مدفوع: Full payment received
- **Partially Paid** / مدفوع جزئياً: Partial payment received
- **Not Paid** / غير مدفوع: No payment received

### Recording Payments / تسجيل المدفوعات

#### Step 1: Basic Payment Info / معلومات الدفع الأساسية
1. **Select Event** / اختر الفعالية: Choose from dropdown list
2. **Payment Date** / تاريخ الدفع: Date payment was received
3. **Amount Paid** / المبلغ المدفوع: Amount in Shekels (₪)
4. **Payment Method** / طريقة الدفع:
   - Cash / نقد
   - Bank Transfer / تحويل بنكي
   - Credit Card / بطاقة ائتمان
   - Check / شيك

#### Step 2: Receipt Upload / رفع الإيصال
1. **Upload Receipt** / رفع الإيصال: 
   - Tap upload button
   - Select image or PDF
   - Supported formats: JPG, PNG, PDF
   - Maximum size: 10MB

2. **Receipt Notes** / ملاحظات الإيصال: Additional information about payment

#### Step 3: Automatic Calculations / الحسابات التلقائية
- **Outstanding Balance** / الرصيد المتبقي: Automatically calculated
- **Payment History** / تاريخ المدفوعات: Shows all payments for this event
- **Total Event Cost** / التكلفة الإجمالية: From events table

### Payment Reminders / تذكيرات الدفع
- System automatically sends payment reminders for overdue balances
- Daily check for payments overdue by 7+ days
- Notifications sent via email and WhatsApp

---

## Employee Management / إدارة الموظفين

### Adding Employee Assignments / إضافة مهام الموظفين

#### Step 1: Employee Information / معلومات الموظف
1. **Select Event** / اختر الفعالية: Event the employee will work
2. **Employee Name** / اسم الموظف: Full name
3. **Role** / الدور:
   - Waiter / نادل
   - Chef / طباخ
   - Security / أمن
   - Cleaner / عامل نظافة
   - DJ / دي جي
   - Manager / مدير
   - Other / أخرى (specify)

#### Step 2: Wage Information / معلومات الأجر
1. **Wage Per Hour** / الأجر بالساعة: Amount in Shekels (₪)
2. **Hours Worked** / ساعات العمل: Total hours (can use half hours: 4.5)
3. **Total Wage** / إجمالي الأجر: Automatically calculated (Wage × Hours)

#### Step 3: Payment Tracking / تتبع الدفع
1. **Payment Date** / تاريخ الدفع: When employee was paid
2. **Payment Status** / حالة الدفع:
   - Paid / مدفوع
   - Pending / في الانتظار
   - Cancelled / ملغي

3. **Notes** / ملاحظات: Additional information about the work

### Employee Reports / تقارير الموظفين
- **Monthly summaries** / ملخصات شهرية: Total wages by employee
- **Role analysis** / تحليل الأدوار: Most needed positions
- **Cost tracking** / تتبع التكاليف: Labor costs per event

---

## Reminders & Tasks / التذكيرات والمهام

### Creating Reminders / إنشاء التذكيرات

#### Step 1: Reminder Details / تفاصيل التذكير
1. **Title** / العنوان: Brief description of task
2. **Description** / الوصف: Detailed explanation
3. **Related Event** / الفعالية المرتبطة: Optional - link to specific event

#### Step 2: Timing / التوقيت
1. **Reminder Date** / تاريخ التذكير: When reminder should trigger
2. **Reminder Time** / وقت التذكير: Specific time
3. **Assignee** / المسؤول: Person responsible for task

#### Step 3: Priority & Recurrence / الأولوية والتكرار
1. **Priority** / الأولوية:
   - Low / منخفضة: General tasks
   - Medium / متوسطة: Important tasks
   - High / عالية: Critical tasks

2. **Recurring** / متكرر: Check if task repeats
3. **Recurrence Pattern** / نمط التكرار:
   - Daily / يومي
   - Weekly / أسبوعي
   - Monthly / شهري
   - Yearly / سنوي

### Predefined Reminders / التذكيرات المحددة مسبقاً
The system includes standard reminders:
- **Turn off generator** / إطفاء المولد: After each event
- **Final payment reminder** / تذكير الدفع النهائي: 1 week before event
- **Setup decoration** / تجهيز الديكور: 2 hours before event
- **Sound system check** / فحص نظام الصوت: Day before event
- **Post-event cleanup** / تنظيف ما بعد الفعالية: After event ends

### Task Management / إدارة المهام
1. **Status Updates** / تحديث الحالة: Mark tasks as completed
2. **Team Assignment** / تعيين الفريق: Assign to specific team members
3. **Due Date Tracking** / تتبع موعد الاستحقاق: Monitor deadlines
4. **Category Organization** / تنظيم الفئات: Group by task type

---

## Reports & Analytics / التقارير والتحليلات

### Monthly Reports / التقارير الشهرية

#### Automatic Generation / الإنتاج التلقائي
- **Schedule** / الجدولة: 1st of each month at 9:00 AM
- **Language** / اللغة: Hebrew (as specified)
- **Delivery** / التسليم: Email + WhatsApp
- **Format** / الصيغة: PDF with charts and tables

#### Manual Reports / التقارير اليدوية
1. **Dashboard Button** / زر لوحة التحكم: "Send Monthly Report"
2. **On-Demand Generation** / الإنتاج عند الطلب: Immediate report creation
3. **Custom Date Range** / نطاق تاريخ مخصص: Specify reporting period

### Report Contents / محتويات التقرير
1. **Financial Summary** / الملخص المالي:
   - Total Revenue / إجمالي الإيرادات
   - Total Expenses / إجمالي المصروفات  
   - Net Profit / صافي الربح
   - Profitability Percentage / نسبة الربحية

2. **Event Analysis** / تحليل الفعاليات:
   - Number of events by type / عدد الفعاليات حسب النوع
   - Average guest count / متوسط عدد الضيوف
   - Location utilization / استخدام المواقع
   - Revenue by event type / الإيرادات حسب نوع الفعالية

3. **Payment Tracking** / تتبع المدفوعات:
   - Outstanding balances / الأرصدة المستحقة
   - Payment methods analysis / تحليل طرق الدفع
   - Collection efficiency / كفاءة التحصيل

4. **Employee Summary** / ملخص الموظفين:
   - Total labor costs / إجمالي تكاليف العمالة
   - Hours worked by role / ساعات العمل حسب الدور
   - Payment status / حالة المدفوعات

---

## Multi-Language Support / الدعم متعدد اللغات

### Language Switching / تبديل اللغة
1. **Settings Menu** / قائمة الإعدادات: Access language options
2. **Available Languages** / اللغات المتاحة:
   - English (Default)
   - Arabic / العربية
   - Hebrew / עברית

3. **Interface Updates** / تحديثات الواجهة: UI changes immediately
4. **RTL Support** / دعم الكتابة من اليمين لليسار: For Arabic and Hebrew

### Translation Features / مميزات الترجمة
- **Dynamic Text** / النص الديناميكي: All UI elements translate
- **Form Labels** / تسميات النماذج: Input field labels
- **Button Text** / نص الأزرار: Action buttons
- **Error Messages** / رسائل الخطأ: System notifications

---

## Notifications / الإشعارات

### Push Notifications / الإشعارات الفورية
- **Reminder Alerts** / تنبيهات التذكير: Task due notifications
- **Payment Alerts** / تنبيهات الدفع: Overdue payment warnings
- **Event Alerts** / تنبيهات الفعاليات: Upcoming event notifications

### WhatsApp Notifications / إشعارات الواتساب
- **New Events** / فعاليات جديدة: When events are created
- **Payment Reminders** / تذكيرات الدفع: For overdue balances
- **Monthly Reports** / التقارير الشهرية: Automatic report delivery
- **High Priority Reminders** / تذكيرات عالية الأولوية: Critical tasks

### Email Notifications / إشعارات البريد الإلكتروني
- **Monthly Reports** / التقارير الشهرية: PDF attachments
- **Payment Summaries** / ملخصات المدفوعات: Daily overdue reports
- **System Alerts** / تنبيهات النظام: Technical notifications

---

## Troubleshooting / استكشاف الأخطاء

### Common Issues / المشاكل الشائعة

#### 1. Data Not Syncing / البيانات لا تتزامن
**Problem**: Changes not appearing in app
**Solution**: 
- Refresh the app by pulling down
- Check internet connection
- Restart the app

#### 2. File Upload Errors / أخطاء رفع الملفات
**Problem**: Cannot upload receipt images
**Solution**:
- Check file size (max 10MB)
- Use supported formats (JPG, PNG, PDF)
- Try different image

#### 3. Language Display Issues / مشاكل عرض اللغة
**Problem**: Text not displaying correctly
**Solution**:
- Check device language settings
- Refresh app after language change
- Clear app cache

#### 4. Calculation Errors / أخطاء الحساب
**Problem**: Incorrect totals or balances
**Solution**:
- Verify all input values
- Check for missing required fields
- Contact support if issue persists

### Contact Support / الاتصال بالدعم
- **Email**: alghadeerevents@gmail.com
- **WhatsApp**: +970595781722
- **Response Time**: Within 24 hours
- **Support Hours**: Sunday-Thursday, 9:00 AM - 6:00 PM

---

## Best Practices / أفضل الممارسات

### Data Entry / إدخال البيانات
1. **Complete Information** / معلومات كاملة: Fill all required fields
2. **Consistent Naming** / تسمية متسقة: Use standard event naming
3. **Regular Updates** / تحديثات منتظمة: Keep payment status current
4. **Receipt Documentation** / توثيق الإيصالات: Upload all payment receipts

### Financial Management / الإدارة المالية
1. **Daily Monitoring** / المراقبة اليومية: Check outstanding balances
2. **Monthly Reviews** / المراجعات الشهرية: Analyze profitability reports
3. **Cost Tracking** / تتبع التكاليف: Monitor employee expenses
4. **Price Updates** / تحديثات الأسعار: Review pricing regularly

### Team Coordination / تنسيق الفريق
1. **Task Assignment** / تعيين المهام: Clear responsibility assignment
2. **Reminder Setting** / وضع التذكيرات: Use system reminders effectively
3. **Status Updates** / تحديثات الحالة: Keep task status current
4. **Communication** / التواصل: Use notes fields for team communication

---

## Advanced Features / المميزات المتقدمة

### Custom Pricing / التسعير المخصص
- **Dynamic Pricing** / التسعير الديناميكي: Adjust based on demand
- **Package Deals** / عروض الحزم: Combine services for discounts
- **Seasonal Pricing** / التسعير الموسمي: Special rates for peak seasons

### Analytics / التحليلات
- **Trend Analysis** / تحليل الاتجاهات: Monthly performance trends
- **Customer Insights** / رؤى العملاء: Payment behavior patterns
- **Resource Optimization** / تحسين الموارد: Employee scheduling insights

### Integration Features / مميزات التكامل
- **Google Calendar Sync** / مزامنة تقويم جوجل: Event scheduling
- **WhatsApp Business API** / واجهة برمجة واتساب الأعمال: Advanced messaging
- **Accounting Software** / برامج المحاسبة: Export financial data

---

This user manual provides comprehensive guidance for using the AlghadeerEvents Management System effectively. For additional support or training, please contact the system administrator or support team.

يوفر هذا الدليل إرشادات شاملة لاستخدام نظام إدارة فعاليات الغدير بفعالية. للحصول على دعم إضافي أو تدريب، يرجى الاتصال بمدير النظام أو فريق الدعم.