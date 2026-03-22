const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Issue = require('./src/models/Issue');

const mockUsers = [
  {
    name: 'Swaroop Jadhav',
    email: 'swaroopjadhav@email.com',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Gayatri Hule',
    email: 'Hulegayatri@gmail.com',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b6b40602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzYwMTU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Tushar Jadhav',
    email: 'tusharjadhav@email.com',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'bhakti Kale',
    email: 'bhaktishakti@email.com',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1NzYwMTU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Ranjit Bhoi',
    email: 'ranjitbhoi@email.com',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTc2MDE1NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  }
];

const mockAdmins = [
  {
    name: 'Admin User',
    email: 'admin@civicfix.local',
    role: 'admin',
  },
  {
    name: 'Shree Joshi',
    email: 'shreejoshi@email.com',
    role: 'admin',
  }
];

const mockIssues = [
  {
    title: 'Large Pothole on Main Road',
    description: 'Deep pothole causing vehicle damage near the market intersection',
    category: 'pothole',
    status: 'in-progress',
    priority: 'high',
    location: { type: 'Point', coordinates: [85.3096, 23.3441], address: 'Main Roadt, Bakori phata, Maharashtra' },
    createdAt: new Date('2026-03-10'),
  },
  {
    title: 'Broken Streetlight',
    description: 'Street light not working for past week, creating safety concerns',
    category: 'streetlight',
    status: 'acknowledged',
    priority: 'medium',
    location: { type: 'Point', coordinates: [85.3371, 23.3629], address: 'Alka Chowk, Pune, Maharashtra' },
    createdAt: new Date('2026-03-12'),
  },
  {
    title: 'Overflowing Garbage Bin',
    description: 'Municipal garbage bin overflowing, attracting stray animals',
    category: 'garbage',
    status: 'resolved',
    priority: 'medium',
    location: { type: 'Point', coordinates: [85.3240, 23.3568], address: 'Kokane Road, Nigdi, Maharashtra' },
    createdAt: new Date('2026-03-05'),
  },
  {
    title: 'Water Leakage',
    description: 'Continuous water leakage from municipal pipeline',
    category: 'water',
    status: 'reported',
    priority: 'high',
    location: { type: 'Point', coordinates: [85.3194, 23.3494], address: 'Circular Road, Nagar Road, Maharashtra' },
    createdAt: new Date('2026-03-15'),
  },
  {
    title: 'Blocked Drainage',
    description: 'Storm drain blocked causing water logging during rain',
    category: 'drainage',
    status: 'in-progress',
    priority: 'high',
    location: { type: 'Point', coordinates: [85.3389, 23.3776], address: 'bhakti-shakti, Nigdi, Maharashtra' },
    createdAt: new Date('2026-03-13'),
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const adminPasswordHash = await bcrypt.hash('adminpass', salt);

    // Seed Users
    const users = await User.insertMany([
      ...mockUsers.map(u => ({ ...u, passwordHash })),
      ...mockAdmins.map(u => ({ ...u, passwordHash: u.email === 'admin@civicfix.local' ? adminPasswordHash : passwordHash }))
    ]);
    console.log(`Seeded ${users.length} users`);

    const admin = users.find(u => u.role === 'admin');

    // Seed Issues
    const issues = await Issue.insertMany(
      mockIssues.map(issue => ({
        ...issue,
        reporterId: admin._id
      }))
    );
    console.log(`Seeded ${issues.length} issues`);

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
