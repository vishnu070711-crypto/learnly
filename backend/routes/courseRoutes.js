const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getCategories,
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload, enforceSizeLimits } = require('../middleware/upload');

router.get('/', getCourses);
router.get('/meta/categories', getCategories);
router.get('/mine/list', protect, authorize('instructor', 'admin'), getMyCourses);
router.get('/:id', getCourse);

router.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  upload.single('thumbnail'),
  enforceSizeLimits,
  createCourse
);
router.put(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  upload.single('thumbnail'),
  enforceSizeLimits,
  updateCourse
);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;
