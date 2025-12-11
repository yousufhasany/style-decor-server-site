const express = require('express');
const router = express.Router();

const {
  createCheckoutSessionForBooking,
  confirmPaymentFromSession,
  getPaymentsByUser
} = require('../controllers/payment.controller');

const { hybridAuth } = require('../middlewares/hybridAuth.middleware');

// Create a checkout session for a specific booking (authenticated user)
router.post('/create-checkout-session', hybridAuth, createCheckoutSessionForBooking);

// Confirm payment after returning from Stripe success page
router.post('/confirm', hybridAuth, confirmPaymentFromSession);

// Get payment history for a user
router.get('/user/:email', hybridAuth, getPaymentsByUser);

module.exports = router;
