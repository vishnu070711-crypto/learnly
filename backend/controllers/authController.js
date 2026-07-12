const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Only allow student/instructor self-registration; admin created separately
  const allowedRole = ['student', 'instructor'].includes(role) ? role : 'student';

  const user = await User.create({ name, email, password, role: allowedRole });

  res.status(201).json({
    success: true,
    token: signToken(user._id),
    user: user.toSafeObject(),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  res.json({
    success: true,
    token: signToken(user._id),
    user: user.toSafeObject(),
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  if (name) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;

  if (req.file) {
    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getMe, updateMe, changePassword };
