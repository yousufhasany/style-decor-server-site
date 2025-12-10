const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getAllBookings, 
  getBookingsByUser, 
  getBookingById, 
  updateBooking, 
  cancelBooking 
} = require('../controllers/booking.controller');
const { hybridAuth } = require('../middlewares/hybridAuth.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Public/Protected routes
router.post('/', hybridAuth, createBooking);
router.get('/user/:userId', getBookingsByUser); // Get bookings by user email
router.get('/:id', getBookingById); // Get single booking
router.put('/:id', updateBooking); // Update booking
router.delete('/:id', cancelBooking); // Cancel booking

// Admin only routes
router.get('/', protect, restrictTo('admin'), getAllBookings); // Get all bookings

module.exports = router;
