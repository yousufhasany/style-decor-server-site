const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userInfo: {
      name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
      }
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    serviceDate: {
      type: Date,
      required: false
    },
    serviceTime: {
      type: String,
      trim: true,
      maxlength: [50, 'Service time cannot exceed 50 characters']
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
      },
      state: {
        type: String,
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters']
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: [20, 'Zip code cannot exceed 20 characters']
      }
    },
    paymentStatus: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      lowercase: true
    },
    assignedDecorator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    decoratorEarning: {
      type: Number,
      required: false,
      min: [0, 'Decorator earning cannot be negative']
    },
    statusSteps: [
      {
        step: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Status step cannot exceed 100 characters']
        },
        completed: {
          type: Boolean,
          default: false
        }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      lowercase: true
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      lowercase: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Virtual field for serviceName (from populated serviceId)
bookingSchema.virtual('serviceName').get(function() {
  return this.serviceId?.service_name || '';
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Pre-save middleware to sync status fields
bookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.bookingStatus = this.status;
  }
  if (this.isModified('bookingStatus')) {
    this.status = this.bookingStatus;
  }
  next();
});

// Index for faster queries
bookingSchema.index({ serviceId: 1, date: 1 });
bookingSchema.index({ 'userInfo.email': 1 });
bookingSchema.index({ assignedDecorator: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
