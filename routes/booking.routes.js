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
  updateBookingStatusSteps,
  rateBookingDecorator
} = require('../controllers/booking.controller');
const { hybridAuth, restrictTo, requireApprovedDecorator } = require('../middlewares/hybridAuth.middleware');

// Public/Protected routes
router.post('/', hybridAuth, createBooking);
router.get('/user/:userId', getBookingsByUser); // Get bookings by user email
router.get('/decorator/:decoratorKey', hybridAuth, getBookingsByDecorator); // Get bookings assigned to a decorator
router.get('/:id', getBookingById); // Get single booking
router.put('/:id', updateBooking); // Update booking
router.delete('/:id', cancelBooking); // Cancel booking

// Admin / Decorator specific routes
router.patch('/:id/assign', hybridAuth, restrictTo('admin'), assignDecorator); // Assign decorator to booking (admin)
// Allow any authenticated decorator to update status steps; admin controls who gets assignments
router.patch('/:id/status', hybridAuth, restrictTo('decorator'), updateBookingStatusSteps); // Update booking status steps (decorator)
router.patch('/:id/rating', hybridAuth, rateBookingDecorator); // User rates decorator/service for this booking

// Admin only routes
router.get('/', hybridAuth, restrictTo('admin'), getAllBookings); // Get all bookings

module.exports = router;
