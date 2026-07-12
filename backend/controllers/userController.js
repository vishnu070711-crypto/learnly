const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, count: users.length, users: users.map((u) => u.toSafeObject()) });
});

// @desc    Update a user's role / active status
// @route   PUT /api/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { role, isActive } = req.body;
  if (role && ['student', 'instructor', 'admin'].includes(role)) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

// @desc    Platform-wide stats for admin dashboard
// @route   GET /api/users/stats/overview
// @access  Private (admin)
const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalStudents, totalInstructors, totalCourses, publishedCourses, totalEnrollments] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments(),
      Course.countDocuments({ published: true }),
      Enrollment.countDocuments(),
    ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
    },
  });
});

module.exports = { getUsers, updateUser, deleteUser, getPlatformStats };
