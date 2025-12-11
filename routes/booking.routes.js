const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getAllBookings, 
  getBookingsByUser, 
  getBookingById, 
  updateBooking, 
  cancelBooking,
  getBookingsByDecorator,
  assignDecorator,
  updateBookingStatusSteps
} = require('../controllers/booking.controller');
const { hybridAuth, requireApprovedDecorator } = require('../middlewares/hybridAuth.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Public/Protected routes
router.post('/', hybridAuth, createBooking);
router.get('/user/:userId', getBookingsByUser); // Get bookings by user email
router.get('/decorator/:decoratorKey', hybridAuth, getBookingsByDecorator); // Get bookings assigned to a decorator
router.get('/:id', getBookingById); // Get single booking
router.put('/:id', updateBooking); // Update booking
router.delete('/:id', cancelBooking); // Cancel booking

// Admin / Decorator specific routes
router.patch('/:id/assign', protect, restrictTo('admin'), assignDecorator); // Assign decorator to booking (admin)
router.patch('/:id/status', hybridAuth, requireApprovedDecorator, updateBookingStatusSteps); // Update booking status steps (decorator)

// Admin only routes
router.get('/', protect, restrictTo('admin'), getAllBookings); // Get all bookings

module.exports = router;
