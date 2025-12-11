const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { 
      userInfo, 
      serviceId, 
      date, 
      serviceDate,
      serviceTime,
      specialRequests,
      location, 
      paymentStatus = 'pending' 
    } = req.body;

    // Validate required fields
    if (!userInfo || !serviceId || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userInfo, serviceId, date, location'
      });
    }

    // Validate userInfo fields
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'User info must include name, email, and phone'
      });
    }

    // Validate location fields
    if (!location.address || !location.city) {
      return res.status(400).json({
        success: false,
        message: 'Location must include address and city'
      });
    }

    // Validate serviceId format
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    // Validate date
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Check if date is in the past
    if (bookingDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past'
      });
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Payment status must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    // Create new booking
    const booking = new Booking({
      userInfo,
      serviceId,
      date: bookingDate,
      serviceDate: serviceDate ? new Date(serviceDate) : bookingDate,
      serviceTime,
      specialRequests,
      location,
      paymentStatus: paymentStatus.toLowerCase(),
      status: 'pending'
    });

    // Save to database
    await booking.save();
    
    // Populate service details
    await booking.populate('serviceId', 'service_name cost unit category description image');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId', 'service_name cost unit category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get bookings by user email
const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find bookings by user email (stored in userInfo.email)
    const bookings = await Booking.find({ 'userInfo.email': userId })
      .populate('serviceId', 'service_name cost unit category description image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    const booking = await Booking.findById(id)
      .populate('serviceId', 'service_name cost unit category description image');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    // Validate date if provided
    if (updates.date) {
      const bookingDate = new Date(updates.date);
      if (isNaN(bookingDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      updates.date = bookingDate;
    }

    // Validate payment status if provided
    if (updates.paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(updates.paymentStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Payment status must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      updates.paymentStatus = updates.paymentStatus.toLowerCase();
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      updates.status = updates.status.toLowerCase();
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('serviceId', 'service_name cost unit category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Cancel/Delete booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    // Option 1: Soft delete by updating status to 'cancelled'
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Assign a decorator to a booking (admin only)
const assignDecorator = async (req, res) => {
  try {
    const { id } = req.params;
    const { decoratorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(decoratorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid decorator ID format'
      });
    }

    const decorator = await User.findById(decoratorId);

    if (!decorator) {
      return res.status(404).json({
        success: false,
        message: 'Decorator not found'
      });
    }

    if (decorator.role !== 'decorator') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a decorator'
      });
    }

    const booking = await Booking.findById(id).populate('serviceId', 'service_name cost unit category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.assignedDecorator = decorator._id;

    // Initialize status steps if not present
    if (!Array.isArray(booking.statusSteps) || booking.statusSteps.length === 0) {
      const isConfirmed = ['confirmed', 'in-progress', 'completed'].includes((booking.status || '').toLowerCase());
      const isInProgress = ['in-progress', 'completed'].includes((booking.status || '').toLowerCase());
      const isCompleted = (booking.status || '').toLowerCase() === 'completed';

      booking.statusSteps = [
        { step: 'Confirmed', completed: isConfirmed },
        { step: 'Planning', completed: isInProgress || isCompleted },
        { step: 'In Progress', completed: isInProgress || isCompleted },
        { step: 'Completed', completed: isCompleted }
      ];
    }

    // Optionally initialize decorator earning if service cost is available and not set yet
    if (!booking.decoratorEarning && booking.serviceId && typeof booking.serviceId.cost === 'number') {
      booking.decoratorEarning = booking.serviceId.cost * 0.7;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Decorator assigned successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error assigning decorator to booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign decorator',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update booking status steps (decorator progress)
const updateBookingStatusSteps = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepIndex, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    if (typeof stepIndex !== 'number' || stepIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid stepIndex (number) is required'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If called by a decorator, ensure they own this booking
    if (req.user && req.user.role === 'decorator' && booking.assignedDecorator && booking.assignedDecorator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this booking'
      });
    }

    if (!Array.isArray(booking.statusSteps) || stepIndex >= booking.statusSteps.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step index for this booking'
      });
    }

    booking.statusSteps[stepIndex].completed = Boolean(completed);

    // Derive overall status from completed steps
    const completedCount = booking.statusSteps.filter(s => s.completed).length;
    let newStatus = booking.status || 'pending';

    if (completedCount === 0) {
      newStatus = 'pending';
    } else if (completedCount === 1) {
      newStatus = 'confirmed';
    } else if (completedCount > 1 && completedCount < booking.statusSteps.length) {
      newStatus = 'in-progress';
    } else if (completedCount === booking.statusSteps.length) {
      newStatus = 'completed';
    }

    booking.status = newStatus;
    booking.bookingStatus = newStatus;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status steps:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingsByUser,
  getBookingById,
  updateBooking,
  cancelBooking,
  getBookingsByDecorator,
  assignDecorator,
  updateBookingStatusSteps
};

// Get bookings assigned to a specific decorator
async function getBookingsByDecorator(req, res) {
  try {
    const { decoratorKey } = req.params;

    if (!decoratorKey) {
      return res.status(400).json({
        success: false,
        message: 'Decorator identifier is required'
      });
    }

    // decoratorKey is expected to be Firebase UID from the frontend
    const decorator = await User.findOne({ firebaseUid: decoratorKey });

    if (!decorator) {
      return res.status(404).json({
        success: false,
        message: 'Decorator not found'
      });
    }

    const bookings = await Booking.find({ assignedDecorator: decorator._id })
      .populate('serviceId', 'service_name cost unit category')
      .sort('-createdAt');

    // Shape data slightly for decorator dashboard convenience
    const projects = bookings.map(b => ({
      _id: b._id,
      serviceId: b.serviceId,
      clientName: b.userInfo?.name,
      date: b.serviceDate || b.date,
      time: b.serviceTime,
      status: b.status,
      totalAmount: b.serviceId?.cost,
      decoratorEarning: b.decoratorEarning || (b.serviceId?.cost ? b.serviceId.cost * 0.7 : 0),
      address: b.location?.address,
      statusSteps: b.statusSteps || []
    }));

    return res.status(200).json({
      success: true,
      count: projects.length,
      bookings: projects
    });
  } catch (error) {
    console.error('Error fetching decorator bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch decorator bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}
