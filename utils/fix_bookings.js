// Script to fix bookings so Stripe payments work
const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const Service = require('../models/service.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hyousuf266_db_user:OP7CyNNDV8Pwzzwb@cluster0.azg3wt3.mongodb.net/styleDecor?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  await mongoose.connect(MONGODB_URI);

  // Find or create a default service
  let service = await Service.findOne({ service_name: 'Default Service' });
  if (!service) {
    service = await Service.create({
      service_name: 'Default Service',
      cost: 1000,
      unit: 'event',
      category: 'General',
      description: 'Default service for fixing bookings',
      image: 'https://via.placeholder.com/150',
      createdByEmail: 'admin@styledecor.com'
    });
    console.log('Created default service:', service._id);
  }

  // Update bookings missing serviceId or cost
  const bookings = await Booking.find({});
  let updated = 0;
  for (const booking of bookings) {
    let needsUpdate = false;
    if (!booking.serviceId) {
      booking.serviceId = service._id;
      needsUpdate = true;
    }
    // If populated, check cost
    if (booking.serviceId && booking.serviceId.cost === undefined) {
      booking.serviceId = service._id;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await booking.save();
      updated++;
    }
  }
  console.log(`Updated ${updated} bookings.`);
  mongoose.disconnect();
}

main().catch(err => {
  console.error('Error fixing bookings:', err);
  mongoose.disconnect();
});
