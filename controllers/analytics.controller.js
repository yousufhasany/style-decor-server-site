const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const Service = require('../models/service.model');
const User = require('../models/user.model');

// Summary stats for admin dashboard
exports.getAdminSummary = async (req, res) => {
  try {
    const [
      totalBookings,
      completedBookings,
      totalServices,
      totalDecorators,
      totalRevenueAgg
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Service.countDocuments(),
      User.countDocuments({ role: 'decorator' }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        completedBookings,
        totalServices,
        totalDecorators,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching admin summary analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin summary analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Bookings per day for last N days
exports.getBookingsTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days + 1);

    const data = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trend = data.map(d => ({
      date: d._id,
      bookings: d.bookings
    }));

    return res.status(200).json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('Error fetching bookings trend:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings trend',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Revenue by service category
exports.getRevenueByCategory = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'services',
          localField: 'booking.serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service.category',
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const categories = data.map(d => ({
      category: d._id || 'Unknown',
      revenue: d.revenue
    }));

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
