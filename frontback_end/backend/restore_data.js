const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Issue = require('./src/models/Issue');

const mockIssues = [
  {
    title: 'Large Pothole on Main Road',
    description: 'Deep pothole causing vehicle damage near the market intersection',
    category: 'pothole',
    status: 'in-progress',
    priority: 'high',
    location: { type: 'Point', coordinates: [85.3096, 23.3441], address: 'Main Roadt, Bakori phata, Maharashtra' },
    createdAt: new Date('2026-01-15'),
  },
  {
    title: 'Broken Streetlight',
    description: 'Street light not working for past week, creating safety concerns',
    category: 'streetlight',
    status: 'acknowledged',
    priority: 'medium',
    location: { type: 'Point', coordinates: [85.3371, 23.3629], address: 'Alka Chowk, Pune, Maharashtra' },
    createdAt: new Date('2026-01-14'),
  },
  {
    title: 'Overflowing Garbage Bin',
    description: 'Municipal garbage bin overflowing, attracting stray animals',
    category: 'garbage',
    status: 'resolved',
    priority: 'medium',
    location: { type: 'Point', coordinates: [85.3240, 23.3568], address: 'Kokane Road, Nigdi, Maharashtra' },
    createdAt: new Date('2026-01-10'),
  },
  {
    title: 'Water Leakage',
    description: 'Continuous water leakage from municipal pipeline',
    category: 'water',
    status: 'reported',
    priority: 'high',
    location: { type: 'Point', coordinates: [85.3194, 23.3494], address: 'Circular Road, Nagar Road, Maharashtra' },
    createdAt: new Date('2026-01-17'),
  },
  {
    title: 'Blocked Drainage',
    description: 'Storm drain blocked causing water logging during rain',
    category: 'drainage',
    status: 'in-progress',
    priority: 'high',
    location: { type: 'Point', coordinates: [85.3389, 23.3776], address: 'bhakti-shakti, Nigdi, Maharashtra' },
    createdAt: new Date('2026-01-13'),
  },
  {
    title: 'Illegal Parking',
    description: 'Vehicles parked illegally blocking emergency exit',
    category: 'traffic',
    status: 'reported',
    priority: 'medium',
    location: { type: 'Point', coordinates: [85.3100, 23.3500], address: 'FC Road, Pune, Maharashtra' },
    createdAt: new Date('2026-03-10'),
  },
  {
    title: 'Vandalism in Public Park',
    description: 'Benches and playground equipment damaged by vandals',
    category: 'park',
    status: 'acknowledged',
    priority: 'low',
    location: { type: 'Point', coordinates: [85.3200, 23.3600], address: 'Kamala Nehru Park, Pune, Maharashtra' },
    createdAt: new Date('2026-03-12'),
  }
];

async function restore() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Restore admin if missing
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('adminpass', salt);
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@civicfix.local',
        passwordHash,
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Add mock issues
    const issuesWithReporter = mockIssues.map(issue => ({
      ...issue,
      reporterId: admin._id
    }));

    await Issue.insertMany(issuesWithReporter);
    console.log(`Successfully restored ${mockIssues.length} issues.`);

    process.exit(0);
  } catch (err) {
    console.error('Restore failed:', err);
    process.exit(1);
  }
}

restore();
