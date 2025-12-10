const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    service_name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [50, 'Unit cannot exceed 50 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    createdByEmail: {
      type: String,
      required: [true, 'Creator email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
serviceSchema.index({ service_name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ createdByEmail: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
