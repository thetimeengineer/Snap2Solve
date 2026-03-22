const express = require('express');
const Vote = require('../models/Vote');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

const router = express.Router();

// Add vote to issue
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const existingVote = await Vote.findOne({
      issueId: issue._id,
      userId: req.user._id
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this issue' });
    }

    const vote = new Vote({
      issueId: issue._id,
      userId: req.user._id
    });

    await vote.save();

    // Increment vote count in Issue
    issue.votes = (issue.votes || 0) + 1;
    await issue.save();

    res.status(201).json({ message: 'Vote added', votes: issue.votes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove vote from issue
router.delete('/:id/vote', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const vote = await Vote.findOneAndDelete({
      issueId: issue._id,
      userId: req.user._id
    });

    if (!vote) {
      return res.status(400).json({ message: 'You have not voted for this issue' });
    }

    // Decrement vote count in Issue
    issue.votes = Math.max(0, (issue.votes || 0) - 1);
    await issue.save();

    res.json({ message: 'Vote removed', votes: issue.votes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
