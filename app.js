require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Prefer STRIPE_SECRET_KEY but fall back to Stripe_api for compatibility
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.Stripe_api || '';
if (!stripeSecretKey) {
  // eslint-disable-next-line no-console
  console.error('Stripe secret key is not configured. Set STRIPE_SECRET_KEY or Stripe_api in your .env file.');
}
const stripe = require('stripe')(stripeSecretKey);
const connectDB = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

// Import routes
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/service.routes');
const paymentRoutes = require('./routes/payment.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize Firebase Admin SDK
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const YOUR_DOMAIN = process.env.CLIENT_URL || 'http://localhost:5173';

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', userRoutes);

// Stripe Checkout Session (equivalent to the sample you provided)
app.post('/api/create-checkout-session', async (req, res, next) => {
  try {
    const { priceId, quantity = 1 } = req.body || {};

    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: 'priceId is required to create a checkout session'
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity
        }
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`
    });

    // For SPA clients it's usually easier to return the URL as JSON
    return res.status(200).json({
      success: true,
      url: session.url
    });
  } catch (err) {
    return next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
