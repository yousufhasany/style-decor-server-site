const express = require('express');
const router = express.Router();

const { hybridAuth, restrictTo } = require('../middlewares/hybridAuth.middleware');
const {
  getAdminSummary,
  getBookingsTrend,
  getRevenueByCategory
} = require('../controllers/analytics.controller');

// All analytics routes are admin-only
router.use(hybridAuth, restrictTo('admin'));

router.get('/summary', getAdminSummary);
router.get('/bookings-trend', getBookingsTrend);
router.get('/revenue-by-category', getRevenueByCategory);

module.exports = router;
