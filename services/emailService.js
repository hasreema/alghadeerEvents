const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'alghadeerevents@gmail.com',
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
  }
});

// Send email function
async function sendEmail({ to, subject, body, attachments = [] }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'alghadeerevents@gmail.com',
      to,
      subject,
      html: body,
      attachments: attachments.map(attachment => ({
        filename: attachment.split('/').pop(),
        path: attachment
      }))
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      to,
      subject
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Send monthly report email
async function sendMonthlyReportEmail(pdfPath, month, year) {
  const subject = `Al Ghadeer Events - Monthly Report ${month}/${year}`;
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #2c3e50; margin: 0;">Al Ghadeer Events</h1>
        <p style="color: #7f8c8d; margin: 10px 0 0 0;">Event Management System</p>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #2c3e50;">Monthly Report - ${month}/${year}</h2>
        
        <p>Dear Team,</p>
        
        <p>Please find attached the monthly report for ${month}/${year}. This report includes:</p>
        
        <ul style="color: #34495e;">
          <li>Financial summary and profitability analysis</li>
          <li>Event statistics by type and location</li>
          <li>Employee payment status</li>
          <li>Payment tracking and outstanding balances</li>
          <li>Reminder and task management overview</li>
        </ul>
        
        <p>If you have any questions or need additional information, please don't hesitate to contact us.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
            Best regards,<br>
            <strong>Al Ghadeer Events Management System</strong><br>
            Email: alghadeerevents@gmail.com<br>
            WhatsApp: +970595781722
          </p>
        </div>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: 'alghadeerevents@gmail.com',
    subject,
    body,
    attachments: [pdfPath]
  });
}

// Send payment reminder email
async function sendPaymentReminderEmail(event, outstandingBalance, totalPaid) {
  const subject = `Payment Reminder - ${event.eventName}`;
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #2c3e50; margin: 0;">Payment Reminder</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #e74c3c;">Outstanding Payment</h2>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #856404;">Event: ${event.eventName}</h3>
          <p style="margin: 5px 0; color: #856404;"><strong>Date:</strong> ${event.eventDate.toLocaleDateString()}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Location:</strong> ${event.location}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Total Cost:</strong> ₪${event.totalCost.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Amount Paid:</strong> ₪${totalPaid.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #e74c3c; font-size: 18px;"><strong>Outstanding Balance:</strong> ₪${outstandingBalance.toLocaleString()}</p>
        </div>
        
        <p>Please process the outstanding payment as soon as possible to ensure smooth event operations.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
            Al Ghadeer Events<br>
            Email: alghadeerevents@gmail.com<br>
            WhatsApp: +970595781722
          </p>
        </div>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: 'alghadeerevents@gmail.com',
    subject,
    body
  });
}

// Send reminder notification email
async function sendReminderNotificationEmail(reminder) {
  const subject = `Reminder: ${reminder.title}`;
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #2c3e50; margin: 0;">Reminder Notification</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #f39c12;">${reminder.title}</h2>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #856404;"><strong>Description:</strong> ${reminder.description || 'No description'}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Assignee:</strong> ${reminder.assignee}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Due Date:</strong> ${reminder.reminderDate.toLocaleDateString()}</p>
          ${reminder.eventId ? `<p style="margin: 5px 0; color: #856404;"><strong>Related Event:</strong> ${reminder.eventId.eventName}</p>` : ''}
        </div>
        
        <p>Please take action on this reminder as soon as possible.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
            Al Ghadeer Events<br>
            Email: alghadeerevents@gmail.com<br>
            WhatsApp: +970595781722
          </p>
        </div>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: 'alghadeerevents@gmail.com',
    subject,
    body
  });
}

// Send event notification email
async function sendEventNotificationEmail(event, notificationType) {
  let subject, title, color;
  
  switch (notificationType) {
    case 'upcoming':
      subject = `Upcoming Event - ${event.eventName}`;
      title = 'Upcoming Event Reminder';
      color = '#3498db';
      break;
    case 'completed':
      subject = `Event Completed - ${event.eventName}`;
      title = 'Event Completed Successfully';
      color = '#27ae60';
      break;
    case 'cancelled':
      subject = `Event Cancelled - ${event.eventName}`;
      title = 'Event Cancelled';
      color = '#e74c3c';
      break;
  }
  
  const body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #2c3e50; margin: 0;">${title}</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: ${color};">${event.eventName}</h2>
        
        <div style="background-color: #f8f9fa; border: 1px solid #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #2c3e50;"><strong>Date:</strong> ${event.eventDate.toLocaleDateString()}</p>
          <p style="margin: 5px 0; color: #2c3e50;"><strong>Time:</strong> ${event.eventTime}</p>
          <p style="margin: 5px 0; color: #2c3e50;"><strong>Location:</strong> ${event.location}</p>
          <p style="margin: 5px 0; color: #2c3e50;"><strong>Type:</strong> ${event.eventType}</p>
          <p style="margin: 5px 0; color: #2c3e50;"><strong>Guest Count:</strong> ${event.guestCount}</p>
          <p style="margin: 5px 0; color: #2c3e50;"><strong>Gender:</strong> ${event.gender}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
            Al Ghadeer Events<br>
            Email: alghadeerevents@gmail.com<br>
            WhatsApp: +970595781722
          </p>
        </div>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: 'alghadeerevents@gmail.com',
    subject,
    body
  });
}

// Test email service
async function testEmailService() {
  try {
    const result = await sendEmail({
      to: 'alghadeerevents@gmail.com',
      subject: 'Test Email - Al Ghadeer Events',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Test Email</h1>
          <p>This is a test email from the Al Ghadeer Events Management System.</p>
          <p>If you receive this email, the email service is working correctly.</p>
        </div>
      `
    });
    
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendEmail,
  sendMonthlyReportEmail,
  sendPaymentReminderEmail,
  sendReminderNotificationEmail,
  sendEventNotificationEmail,
  testEmailService
};