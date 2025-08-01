const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  reminderDate: {
    type: Date,
    required: [true, 'Reminder date is required']
  },
  assignee: {
    type: String,
    required: [true, 'Assignee is required'],
    trim: true,
    maxlength: [100, 'Assignee name cannot exceed 100 characters']
  },
  reminderType: {
    type: String,
    enum: ['one-time', 'recurring'],
    required: [true, 'Reminder type is required']
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.reminderType === 'recurring';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted reminder date
reminderSchema.virtual('formattedReminderDate').get(function() {
  return this.reminderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for formatted reminder time
reminderSchema.virtual('formattedReminderTime').get(function() {
  return this.reminderDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for days until reminder
reminderSchema.virtual('daysUntilReminder').get(function() {
  const today = new Date();
  const reminderDate = new Date(this.reminderDate);
  const diffTime = reminderDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for reminder urgency
reminderSchema.virtual('urgency').get(function() {
  if (this.status !== 'pending') return 'none';
  
  const daysUntil = this.daysUntilReminder;
  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0) return 'today';
  if (daysUntil <= 1) return 'urgent';
  if (daysUntil <= 3) return 'soon';
  if (daysUntil <= 7) return 'upcoming';
  return 'normal';
});

// Virtual for status color
reminderSchema.virtual('statusColor').get(function() {
  const colors = {
    'pending': 'orange',
    'completed': 'green',
    'cancelled': 'red'
  };
  return colors[this.status] || 'gray';
});

// Virtual for urgency color
reminderSchema.virtual('urgencyColor').get(function() {
  const colors = {
    'overdue': 'red',
    'urgent': 'orange',
    'soon': 'yellow',
    'upcoming': 'blue',
    'normal': 'green',
    'none': 'gray'
  };
  return colors[this.urgency] || 'gray';
});

// Virtual for reminder icon
reminderSchema.virtual('reminderIcon').get(function() {
  const icons = {
    'overdue': '⏰',
    'urgent': '🚨',
    'soon': '⚠️',
    'upcoming': '📅',
    'normal': '📝',
    'none': '✅'
  };
  return icons[this.urgency] || '📝';
});

// Index for better query performance
reminderSchema.index({ reminderDate: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ assignee: 1 });
reminderSchema.index({ eventId: 1 });
reminderSchema.index({ reminderType: 1 });

// Static method to get overdue reminders
reminderSchema.statics.getOverdueReminders = function() {
  return this.find({
    reminderDate: { $lt: new Date() },
    status: 'pending'
  }).populate('eventId');
};

// Static method to get upcoming reminders
reminderSchema.statics.getUpcomingReminders = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    reminderDate: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: 'pending'
  }).populate('eventId');
};

// Static method to get reminders by assignee
reminderSchema.statics.getRemindersByAssignee = function(assignee) {
  return this.find({
    assignee: { $regex: assignee, $options: 'i' }
  }).populate('eventId');
};

// Static method to get reminders by event
reminderSchema.statics.getRemindersByEvent = function(eventId) {
  return this.find({ eventId }).sort({ reminderDate: 1 });
};

// Static method to create recurring reminders
reminderSchema.statics.createRecurringReminder = function(reminderData, endDate) {
  const reminders = [];
  let currentDate = new Date(reminderData.reminderDate);
  
  while (currentDate <= endDate) {
    const reminder = new this({
      ...reminderData,
      reminderDate: new Date(currentDate)
    });
    reminders.push(reminder);
    
    // Calculate next occurrence based on pattern
    switch (reminderData.recurrencePattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  return reminders;
};

// Instance method to check if reminder is overdue
reminderSchema.methods.isOverdue = function() {
  return this.status === 'pending' && this.reminderDate < new Date();
};

// Instance method to check if reminder is due today
reminderSchema.methods.isDueToday = function() {
  const today = new Date();
  const reminderDate = new Date(this.reminderDate);
  return this.status === 'pending' && 
         reminderDate.toDateString() === today.toDateString();
};

// Instance method to check if reminder is due soon
reminderSchema.methods.isDueSoon = function(days = 3) {
  const today = new Date();
  const reminderDate = new Date(this.reminderDate);
  const diffTime = reminderDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return this.status === 'pending' && diffDays >= 0 && diffDays <= days;
};

// Pre-save middleware to validate recurring reminders
reminderSchema.pre('save', function(next) {
  if (this.reminderType === 'recurring' && !this.recurrencePattern) {
    return next(new Error('Recurrence pattern is required for recurring reminders'));
  }
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);