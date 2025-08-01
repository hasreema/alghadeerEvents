const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [100, 'Employee name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Employee role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  wage: {
    type: Number,
    required: [true, 'Employee wage is required'],
    min: [0, 'Wage cannot be negative']
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required']
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
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

// Virtual for formatted payment date
employeeSchema.virtual('formattedPaymentDate').get(function() {
  return this.paymentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted wage
employeeSchema.virtual('formattedWage').get(function() {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(this.wage);
});

// Virtual for payment status color
employeeSchema.virtual('statusColor').get(function() {
  const colors = {
    'paid': 'green',
    'pending': 'orange',
    'overdue': 'red'
  };
  return colors[this.paymentStatus] || 'gray';
});

// Virtual for days until payment
employeeSchema.virtual('daysUntilPayment').get(function() {
  const today = new Date();
  const paymentDate = new Date(this.paymentDate);
  const diffTime = paymentDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for payment urgency
employeeSchema.virtual('paymentUrgency').get(function() {
  const daysUntil = this.daysUntilPayment;
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 7) return 'soon';
  return 'normal';
});

// Pre-save middleware to update payment status
employeeSchema.pre('save', function(next) {
  const today = new Date();
  const paymentDate = new Date(this.paymentDate);
  
  if (this.paymentStatus === 'paid') {
    // If already paid, don't change status
  } else if (paymentDate < today) {
    this.paymentStatus = 'overdue';
  } else {
    this.paymentStatus = 'pending';
  }
  
  next();
});

// Index for better query performance
employeeSchema.index({ eventId: 1 });
employeeSchema.index({ paymentDate: 1 });
employeeSchema.index({ paymentStatus: 1 });
employeeSchema.index({ name: 1 });

// Static method to get employees by event
employeeSchema.statics.getEmployeesByEvent = function(eventId) {
  return this.find({ eventId })
    .sort({ paymentDate: 1 });
};

// Static method to get overdue payments
employeeSchema.statics.getOverduePayments = function() {
  return this.find({
    paymentStatus: 'overdue'
  }).populate('eventId');
};

// Static method to get upcoming payments
employeeSchema.statics.getUpcomingPayments = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    paymentDate: {
      $gte: new Date(),
      $lte: futureDate
    },
    paymentStatus: { $ne: 'paid' }
  }).populate('eventId');
};

// Static method to get total labor cost by event
employeeSchema.statics.getTotalLaborCostByEvent = function(eventId) {
  return this.aggregate([
    {
      $match: { eventId: mongoose.Types.ObjectId(eventId) }
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$wage' },
        employeeCount: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get employee statistics
employeeSchema.statics.getEmployeeStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalWages: { $sum: '$wage' },
        averageWage: { $avg: '$wage' },
        paidCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
          }
        },
        pendingCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0]
          }
        },
        overdueCount: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'overdue'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Instance method to mark as paid
employeeSchema.methods.markAsPaid = function() {
  this.paymentStatus = 'paid';
  return this.save();
};

// Instance method to check if payment is overdue
employeeSchema.methods.isOverdue = function() {
  const today = new Date();
  const paymentDate = new Date(this.paymentDate);
  return paymentDate < today && this.paymentStatus !== 'paid';
};

module.exports = mongoose.model('Employee', employeeSchema);