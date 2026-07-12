const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Material = require('../models/Material');

// @desc    Enroll in a course (free instantly, paid goes to pending -> confirm)
// @route   POST /api/enrollments/:courseId
// @access  Private (student)
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || !course.published) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (existing) {
    res.status(400);
    throw new Error('You are already enrolled in this course');
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    paymentStatus: course.isPaid ? 'pending' : 'free',
    amountPaid: 0,
  });

  if (!course.isPaid) {
    course.enrollmentCount += 1;
    await course.save();
  }

  res.status(201).json({ success: true, enrollment });
});

// @desc    Confirm payment for a paid course (simulated payment gateway)
// @route   POST /api/enrollments/:id/confirm-payment
// @access  Private (student)
const confirmPayment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('course');
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }
  if (enrollment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (enrollment.paymentStatus === 'confirmed') {
    res.status(400);
    throw new Error('Payment already confirmed');
  }

  // Simulated confirmation - in production integrate Stripe/Razorpay here
  enrollment.paymentStatus = 'confirmed';
  enrollment.amountPaid = enrollment.course.price;
  await enrollment.save();

  const course = await Course.findById(enrollment.course._id);
  course.enrollmentCount += 1;
  await course.save();

  res.json({ success: true, enrollment });
});

// @desc    Get enrollments for the logged in student
// @route   GET /api/enrollments/mine
// @access  Private (student)
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
    .sort('-createdAt');
  res.json({ success: true, count: enrollments.length, enrollments });
});

// @desc    Check enrollment status for a course
// @route   GET /api/enrollments/status/:courseId
// @access  Private (student)
const getEnrollmentStatus = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });
  res.json({ success: true, enrolled: !!enrollment, enrollment: enrollment || null });
});

// @desc    Mark a material as completed to update progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private (student)
const updateProgress = asyncHandler(async (req, res) => {
  const { materialId } = req.body;
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }
  if (enrollment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (materialId && !enrollment.completedMaterials.includes(materialId)) {
    enrollment.completedMaterials.push(materialId);
  }

  const totalMaterials = await Material.countDocuments({ course: enrollment.course });
  const completedCount = enrollment.completedMaterials.length;
  enrollment.progress = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;
  enrollment.completed = enrollment.progress >= 100;

  await enrollment.save();
  res.json({ success: true, enrollment });
});

// @desc    Cancel a student's enrollment in a course
// @route   DELETE /api/enrollments/:courseId
// @access  Private (student)
const cancelEnrollment = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  const wasActive = ['free', 'confirmed'].includes(enrollment.paymentStatus);
  if (wasActive) {
    course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);
    await course.save();
  }

  await Enrollment.deleteOne({ _id: enrollment._id });
  res.json({ success: true, message: 'Enrollment canceled successfully' });
});

// @desc    Get all students enrolled in a course (for instructor)
// @route   GET /api/enrollments/course/:courseId
// @access  Private (instructor/admin)
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate('student', 'name email avatar')
    .sort('-createdAt');

  res.json({ success: true, count: enrollments.length, enrollments });
});

module.exports = {
  enrollInCourse,
  confirmPayment,
  getMyEnrollments,
  getEnrollmentStatus,
  updateProgress,
  cancelEnrollment,
  getCourseEnrollments,
};
