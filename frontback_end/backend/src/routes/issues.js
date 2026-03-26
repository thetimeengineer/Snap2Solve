const express = require('express');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const User = require('../models/User');
const auth = require('../middleware/auth');

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();
const { createIssueSchema, updateIssueSchema } = require('../validators/issue');


// -------------------- MULTER CONFIG --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// -------------------- CREATE ISSUE --------------------
router.post('/', auth, upload.single("image"), async (req, res, next) => {

  // Parse location if it's a string
  if (typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch (e) {}
  }

  const { error, value } = createIssueSchema.validate(req.body, { stripUnknown: true });

  if (error) return res.status(400).json({ message: error.details[0].message });

  try {

    const { title, description, category, priority, location, labels } = value;

    const issue = new Issue({
      title,
      description,
      category,
      priority: priority || "medium",
      reporterId: req.user._id,
      image: req.file ? req.file.path : undefined,
      labels: labels || [],
      location: location
        ? {
            type: "Point",
            coordinates: location.coordinates
          }
        : undefined
    });

    await issue.save();

    // 10 POINTS SYSTEM: Award 10 points to the user for reporting a valid issue
    try {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: 10 }
      });
    } catch (userErr) {
      console.error("Failed to award points:", userErr);
    }

    res.status(201).json(issue);

  } catch (err) {
    next(err);
  }
});


// -------------------- AI IMAGE DETECTION --------------------
router.post('/detect', auth, upload.single("image"), async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const imagePath = req.file.path;
    console.log(`DEBUG: Detecting issues in image: ${imagePath}`);

    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    const aiServerUrl = process.env.AI_SERVER_URL || "http://127.0.0.1:8000";
    console.log(`DEBUG: Calling AI Server at: ${aiServerUrl}/detect`);

    const aiResponse = await axios.post(
      `${aiServerUrl}/detect`,
      form,
      { 
        headers: form.getHeaders(),
        timeout: 90000 // 90 second timeout - YOLO inference on Render Free is slow (30-50s)
      }
    );

    const aiData = aiResponse.data;
    console.log(`DEBUG: AI Server Response:`, aiData);

    res.json({
      message: "AI detection completed",
      prediction: aiData.prediction,
      confidence: aiData.confidence,
      department: aiData.department,
      all_detections: aiData.all_detections
    });

  } catch (error) {
    console.error("ERROR: AI Detection Failed");
    if (error.response) {
      // AI server responded with an error
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      // No response from AI server
      console.error(`No response from AI server at ${process.env.AI_SERVER_URL}`);
    } else {
      console.error(`Error: ${error.message}`);
    }

    res.status(500).json({
      message: "AI detection failed. The AI server might be offline or waking up. Please try again in a few seconds.",
      error: error.message
    });
  }
});


// -------------------- LIST ISSUES --------------------
router.get('/', async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { status, priority, category, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Math.min(limit, 100))
      .populate('reporterId', 'name email phone')
      .populate('attachments');

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      page,
      limit,
      total
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// -------------------- GET SINGLE ISSUE --------------------
router.get('/:id', async (req, res) => {

  try {

    const issue = await Issue.findById(req.params.id)
      .populate('reporterId', 'name email phone')
      .populate('attachments');

    if (!issue)
      return res.status(404).json({ message: 'Issue not found' });

    res.json(issue);

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: 'Server error' });
  }
});


// -------------------- UPDATE ISSUE --------------------
router.put('/:id', auth, async (req, res, next) => {

  const { error, value } = updateIssueSchema.validate(req.body, { stripUnknown: true });

  if (error)
    return res.status(400).json({ message: error.details[0].message });

  try {

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ message: 'Issue not found' });

    if (
      String(issue.reporterId) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatableFields = [
      'title',
      'description',
      'category',
      'priority',
      'status',
      'location'
    ];

    updatableFields.forEach(field => {
      if (field in value) issue[field] = value[field];
    });

    await issue.save();

    res.json(issue);

  } catch (err) {
    next(err);
  }
});


// -------------------- DELETE ISSUE --------------------
router.delete('/:id', auth, async (req, res) => {

  try {

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ message: 'Issue not found' });

    if (
      String(issue.reporterId) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Attachment.deleteMany({ issueId: issue._id });
    await Comment.deleteMany({ issueId: issue._id });

    await issue.deleteOne();

    res.json({ message: 'Deleted successfully' });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;