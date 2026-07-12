const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Create an assignment for a course
// @route   POST /api/assignments/:courseId
// @access  Private (owner instructor, admin)
const createAssignment = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, description, dueDate, maxScore } = req.body;
  const assignment = await Assignment.create({
    course: course._id,
    title,
    description,
    dueDate,
    maxScore: maxScore || 100,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, assignment });
});

// @desc    Get assignments for a course
// @route   GET /api/assignments/:courseId
// @access  Private
const getCourseAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ course: req.params.courseId }).sort('dueDate');
  res.json({ success: true, count: assignments.length, assignments });
});

// @desc    Get a single assignment by id
// @route   GET /api/assignments/single/:id
// @access  Private
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate('course', 'title instructor');
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  res.json({ success: true, assignment });
});

// @desc    Submit an assignment
// @route   POST /api/assignments/submit/:assignmentId
// @access  Private (student)
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: assignment.course._id,
    paymentStatus: { $in: ['free', 'confirmed'] },
  });
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled in this course to submit assignments');
  }

  const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already submitted this assignment');
  }

  const status = new Date() > new Date(assignment.dueDate) ? 'late' : 'submitted';

  const submission = await Submission.create({
    assignment: assignment._id,
    student: req.user._id,
    content: req.body.content,
    fileUrl: req.file ? `/uploads/${req.file.materialType === 'pdf' ? 'pdfs' : 'ppts'}/${req.file.filename}` : '',
    status,
  });

  res.status(201).json({ success: true, submission });
});

// @desc    Get all submissions for an assignment (instructor grading view)
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private (owner instructor, admin)
const getSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (
    assignment.course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const submissions = await Submission.find({ assignment: assignment._id })
    .populate('student', 'name email avatar')
    .sort('-submittedAt');

  res.json({ success: true, count: submissions.length, submissions });
});

// @desc    Get logged-in student's own submission for an assignment
// @route   GET /api/assignments/:assignmentId/my-submission
// @access  Private (student)
const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    assignment: req.params.assignmentId,
    student: req.user._id,
  });
  res.json({ success: true, submission: submission || null });
});

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Private (owner instructor, admin)
const gradeSubmission = asyncHandler(async (req, res) => {
  const { score, feedback } = req.body;
  const submission = await Submission.findById(req.params.submissionId).populate({
    path: 'assignment',
    populate: { path: 'course' },
  });
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  if (
    submission.assignment.course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  submission.score = score;
  submission.feedback = feedback || '';
  submission.status = 'graded';
  submission.gradedAt = new Date();
  await submission.save();

  res.json({ success: true, submission });
});

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
};
