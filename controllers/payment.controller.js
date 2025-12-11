const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');

// Initialize Stripe separately here to avoid circular deps
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.Stripe_api || '';
const stripe = require('stripe')(stripeSecretKey);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create a Checkout Session for a booking
exports.createCheckoutSessionForBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid bookingId is required'
      });
    }

    const booking = await Booking.findById(bookingId).populate('serviceId', 'service_name cost');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus && booking.paymentStatus.toLowerCase() === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already paid'
      });
    }

    const amountTaka = booking.serviceId?.cost || 0;
    if (!amountTaka || amountTaka <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service cost for this booking'
      });
    }

    // Stripe expects amount in the smallest currency unit
    const amountMinorUnit = Math.round(amountTaka * 100);

    const session = await stripe.checkout.sessions.create({
      client_reference_id: booking._id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            unit_amount: amountMinorUnit,
            product_data: {
              name: booking.serviceId.service_name || 'StyleDecor Service Booking'
            }
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/bookings?canceled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      metadata: {
        bookingId: booking._id.toString(),
        userEmail: booking.userInfo.email
      }
    });

    // Create a pending Payment record
    const payment = await Payment.create({
      booking: booking._id,
      userEmail: booking.userInfo.email,
      amount: amountTaka,
      currency: 'BDT',
      status: 'pending',
      stripeSessionId: session.id
    });

    return res.status(201).json({
      success: true,
      message: 'Checkout session created successfully',
      url: session.url,
      sessionId: session.id,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Confirm payment after successful checkout
exports.confirmPaymentFromSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Checkout session not found'
      });
    }

    const paymentIntentId = session.payment_intent;
    let receiptUrl = null;

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const charge = paymentIntent.charges?.data?.[0];
      if (charge && charge.receipt_url) {
        receiptUrl = charge.receipt_url;
      }
    }

    // Update Payment record
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        status: session.payment_status === 'paid' ? 'paid' : session.payment_status,
        stripePaymentIntentId: paymentIntentId,
        receiptUrl
      },
      { new: true }
    );

    // Also update related booking paymentStatus
    if (payment && payment.booking) {
      const booking = await Booking.findByIdAndUpdate(
        payment.booking,
        { paymentStatus: 'paid', status: 'confirmed', bookingStatus: 'confirmed' },
        { new: true }
      ).populate('serviceId', 'service_name cost unit category');

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        payment,
        booking
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment status updated',
      payment
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get payment history for a user
exports.getPaymentsByUser = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const payments = await Payment.find({ userEmail: email.toLowerCase() })
      .populate({
        path: 'booking',
        populate: { path: 'serviceId', select: 'service_name cost unit category' }
      })
      .sort('-createdAt');

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
