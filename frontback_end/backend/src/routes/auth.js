const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const auth = require("../middleware/auth");

const User = require("../models/User");
const { registerSchema, loginSchema } = require("../validators/auth");

const router = express.Router();

// -------------------- MULTER CONFIG FOR AVATARS --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("uploads/avatars")) {
      fs.mkdirSync("uploads/avatars", { recursive: true });
    }
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ---------------- REGISTER USER ---------------- */

router.post("/register", async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, {
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name, email, password, role, phone, department, employeeId } = value;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'user',
      phone,
      department,
      employeeId
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "replace_with_strong_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        employeeId: user.employeeId
      }
    });

  } catch (err) {
    next(err);
  }
});

/* ---------------- LOGIN USER ---------------- */

router.post("/login", async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "replace_with_strong_secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        employeeId: user.employeeId
      }
    });

  } catch (err) {
    next(err);
  }
});
/* ---------------- GET CURRENT USER ---------------- */

router.get("/me", async (req, res) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "replace_with_strong_secret"
    );

    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

/* ---------------- UPDATE PROFILE ---------------- */

router.put("/profile", auth, upload.single("avatar"), async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (req.file) {
      user.avatarUrl = req.file.path.replace(/\\/g, '/');
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        points: user.points
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- GET LEADERBOARD ---------------- */

router.get("/leaderboard", async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select("name avatarUrl points")
      .sort({ points: -1 })
      .limit(10);
    
    res.json({ leaderboard: users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;