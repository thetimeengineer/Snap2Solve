const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDatabase = require('../config/db');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');

async function seed() {
  try {
    await connectDatabase();
    console.log('Seeding database...');

    // clear minimal collections (be careful in production!)
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Attachment.deleteMany({})
    ]);

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('adminpass', salt);
    const userPass = await bcrypt.hash('userpass', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@civicfix.local',
      passwordHash: adminPass,
      role: 'admin'
    });

    const citizenNames = [
      'Rajesh Kumar', 'Anjali Sharma', 'Suresh Patil', 'Priya Deshmukh', 
      'Amit Pawar', 'Neha Kulkarni', 'Vikram Singh', 'Sneha More',
      'Rahul Gadkari', 'Meera Joshi'
    ];

    const citizens = [];
    for (let i = 0; i < citizenNames.length; i++) {
      const citizen = await User.create({
        name: citizenNames[i],
        email: `citizen${i + 1}@civicfix.local`,
        passwordHash: userPass,
        role: 'user',
        points: Math.floor(Math.random() * 500)
      });
      citizens.push(citizen);
    }

    const categories = ['pothole', 'garbage', 'water', 'electricity', 'traffic', 'other'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['reported', 'acknowledged', 'in-progress', 'resolved', 'closed'];

    const issueTitles = [
      'Large pothole on MG Road',
      'Overflowing garbage bin near Central Park',
      'Water leakage in housing society',
      'Street light not working',
      'Traffic signal malfunctioning at main junction',
      'Broken drainage pipe near school',
      'Illegal dumping of waste',
      'Low water pressure in Sector 5',
      'Power outage in residential area',
      'Damaged road divider'
    ];

    for (let i = 0; i < issueTitles.length; i++) {
      const citizen = citizens[Math.floor(Math.random() * citizens.length)];
      const issue = await Issue.create({
        title: issueTitles[i],
        description: `This is a reported issue regarding ${issueTitles[i].toLowerCase()}. Needs urgent attention.`,
        reporterId: citizen._id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        location: { 
          type: 'Point', 
          coordinates: [73.8567 + (Math.random() - 0.5) * 0.1, 18.5204 + (Math.random() - 0.5) * 0.1] 
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });

      // Add a comment to some issues
      if (Math.random() > 0.5) {
        await Comment.create({
          issueId: issue._id,
          authorId: admin._id,
          body: 'Our team is looking into this report.'
        });
      }
    }

    console.log('Seed completed:');
    console.log('Users:', await User.countDocuments());
    console.log('Issues:', await Issue.countDocuments());
    console.log('Comments:', await Comment.countDocuments());
    console.log('Attachments:', await Attachment.countDocuments());

    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
}

seed();





