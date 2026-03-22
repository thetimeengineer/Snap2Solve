const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// List users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Get user by id (self or admin)
router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) !== String(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update user (self or admin)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) !== String(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updatable = ['name', 'avatarUrl', 'role', 'status'];
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    updatable.forEach((f) => {
      if (f in req.body) user[f] = req.body[f];
    });
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl });
  } catch (err) {
    next(err);
  }
});

module.exports = router;





