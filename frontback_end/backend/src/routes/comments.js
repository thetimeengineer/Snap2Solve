const express = require('express');
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

const router = express.Router();

const { createCommentSchema } = require('../validators/comment');

// Add comment to issue
router.post('/:id/comments', auth, async (req, res, next) => {
  const { error, value } = createCommentSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    const { body } = value;
    if (!body) return res.status(400).json({ message: 'Empty comment' });
    const comment = new Comment({
      issueId: issue._id,
      authorId: req.user._id,
      body
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// Get comments for issue
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ issueId: req.params.id })
      .populate('authorId', 'name email role avatarUrl')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


