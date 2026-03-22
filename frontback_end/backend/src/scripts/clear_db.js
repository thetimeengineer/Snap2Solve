const mongoose = require('mongoose');
require('dotenv').config();
const connectDatabase = require('../config/db');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const Vote = require('../models/Vote');
const IssueHistory = require('../models/IssueHistory');

async function clearDatabase() {
  try {
    await connectDatabase();
    console.log('Clearing database...');

    // Delete all except admin users? 
    // Actually, let's delete everything and let the user re-register or use seed for just admin.
    
    await Promise.all([
      User.deleteMany({ role: { $ne: 'admin' } }), // Keep admin users
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Attachment.deleteMany({}),
      Vote.deleteMany({}),
      IssueHistory.deleteMany({})
    ]);

    console.log('Database cleared of mock issues and non-admin users.');
    
    const issueCount = await Issue.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`Remaining Issues: ${issueCount}`);
    console.log(`Remaining Users (Admins): ${userCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Clear failed', err);
    process.exit(1);
  }
}

clearDatabase();
