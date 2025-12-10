const mongoose = require('mongoose');
const Service = require('../models/service.model');
require('dotenv').config();

// Sample services data
const sampleServices = [
  {
    service_name: 'Premium Wedding Decoration',
    cost: 50000,
    unit: 'event',
    category: 'wedding',
    description: 'Complete wedding decoration package including stage setup, lighting, floral arrangements, and entrance decoration. Perfect for creating your dream wedding atmosphere.',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Birthday Party Decoration',
    cost: 5000,
    unit: 'event',
    category: 'birthday',
    description: 'Fun and colorful birthday party decoration with balloons, banners, themed props, and personalized birthday setup.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Corporate Event Setup',
    cost: 35000,
    unit: 'event',
    category: 'corporate',
    description: 'Professional corporate event decoration including branding, stage setup, presentation area, and networking zones.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Smart Home Interior Design',
    cost: 150000,
    unit: 'project',
    category: 'home',
    description: 'Complete smart home interior design with automated lighting, climate control, security systems, and modern furnishing.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Office Interior Decoration',
    cost: 75000,
    unit: 'project',
    category: 'office',
    description: 'Modern office interior design with ergonomic furniture, collaborative spaces, and productivity-focused layouts.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Seminar Hall Setup',
    cost: 15000,
    unit: 'event',
    category: 'seminar',
    description: 'Professional seminar and conference hall setup with audio-visual equipment, seating arrangements, and stage decoration.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Meeting Room Design',
    cost: 25000,
    unit: 'room',
    category: 'meeting',
    description: 'Smart meeting room design with video conferencing setup, interactive displays, and comfortable seating.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Garden Party Decoration',
    cost: 12000,
    unit: 'event',
    category: 'birthday',
    description: 'Beautiful outdoor garden party decoration with fairy lights, floral arrangements, and themed seating areas.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Anniversary Celebration Setup',
    cost: 20000,
    unit: 'event',
    category: 'wedding',
    description: 'Romantic anniversary celebration decoration with elegant table settings, ambient lighting, and personalized touches.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    createdByEmail: 'admin@styledecor.com'
  },
  {
    service_name: 'Product Launch Event',
    cost: 45000,
    unit: 'event',
    category: 'corporate',
    description: 'Dynamic product launch event setup with branding displays, interactive zones, and media-ready presentation areas.',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    createdByEmail: 'admin@styledecor.com'
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/styleDecor');
    console.log('✅ Connected to MongoDB');

    // Clear existing services (optional - comment out if you want to keep existing data)
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Insert sample services
    const result = await Service.insertMany(sampleServices);
    console.log(`✅ Successfully added ${result.length} services to the database`);

    // Display inserted services
    console.log('\n📋 Inserted Services:');
    result.forEach((service, index) => {
      console.log(`${index + 1}. ${service.service_name} - ৳${service.cost}/${service.unit} (${service.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
