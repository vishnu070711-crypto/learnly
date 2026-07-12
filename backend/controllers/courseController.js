const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Material = require('../models/Material');
const Assignment = require('../models/Assignment');

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
};

// @desc    Get all published courses (with search/filter/pagination)
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const { search, category, level, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

  const query = { published: true };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (level) query.level = level;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('instructor', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Course.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: courses.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    courses,
  });
});

// @desc    Get single course by id
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name avatar bio');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, course });
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (instructor, admin)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, shortDescription, category, level, price, tags } = req.body;
  const published = req.body.published === undefined ? true : parseBoolean(req.body.published, true);

  const course = await Course.create({
    title,
    description,
    shortDescription,
    category,
    level,
    price: Number(price) || 0,
    isPaid: Number(price) > 0,
    published,
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    instructor: req.user._id,
    thumbnail: req.file ? `/uploads/avatars/${req.file.filename}` : '',
  });

  res.status(201).json({ success: true, course });
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (owner instructor, admin)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this course');
  }

  const fields = ['title', 'description', 'shortDescription', 'category', 'level', 'price'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  if (req.body.published !== undefined) {
    course.published = parseBoolean(req.body.published, course.published);
  }
  if (req.body.tags) {
    course.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  if (req.body.price !== undefined) course.isPaid = Number(req.body.price) > 0;
  if (req.file) course.thumbnail = `/uploads/avatars/${req.file.filename}`;

  await course.save();
  res.json({ success: true, course });
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (owner instructor, admin)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Material.deleteMany({ course: course._id }),
    Assignment.deleteMany({ course: course._id }),
  ]);
  await course.deleteOne();

  res.json({ success: true, message: 'Course deleted successfully' });
});

// @desc    Get courses created by logged in instructor
// @route   GET /api/courses/mine/list
// @access  Private (instructor, admin)
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: courses.length, courses });
});

// @desc    Get all distinct categories
// @route   GET /api/courses/meta/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.distinct('category', { published: true });
  res.json({ success: true, categories });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getCategories,
};
