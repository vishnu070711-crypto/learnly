const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const Material = require('../models/Material');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const folderFor = (type) => (type === 'video' ? 'videos' : type === 'pdf' ? 'pdfs' : 'ppts');

// @desc    Upload a study material to a course
// @route   POST /api/materials/:courseId
// @access  Private (owner instructor, admin)
const uploadMaterial = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add materials to this course');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { title, description, order } = req.body;
  const type = req.file.materialType;

  const material = await Material.create({
    course: course._id,
    title: title || req.file.originalname,
    description: description || '',
    type,
    fileUrl: `/uploads/${folderFor(type)}/${req.file.filename}`,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    order: order || 0,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, material });
});

// @desc    Get all materials for a course (enrolled students, owner instructor, admin)
// @route   GET /api/materials/:courseId
// @access  Private
const getCourseMaterials = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isOwner = course.instructor.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
      paymentStatus: { $in: ['free', 'confirmed'] },
    });
    if (!enrollment) {
      res.status(403);
      throw new Error('You must be enrolled in this course to view materials');
    }
  }

  const materials = await Material.find({ course: course._id }).sort('order createdAt');
  res.json({ success: true, count: materials.length, materials });
});

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private (owner instructor, admin)
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate('course');
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }
  if (
    material.course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this material');
  }

  const filePath = path.join(__dirname, '..', material.fileUrl);
  fs.unlink(filePath, () => {}); // best-effort cleanup

  await material.deleteOne();
  res.json({ success: true, message: 'Material deleted successfully' });
});

module.exports = { uploadMaterial, getCourseMaterials, deleteMaterial };
