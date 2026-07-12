const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  confirmPayment,
  getMyEnrollments,
  getEnrollmentStatus,
  updateProgress,
  cancelEnrollment,
  getCourseEnrollments,
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/mine', protect, authorize('student'), getMyEnrollments);
router.get('/status/:courseId', protect, authorize('student'), getEnrollmentStatus);
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), getCourseEnrollments);
router.post('/:courseId', protect, authorize('student'), enrollInCourse);
router.post('/:id/confirm-payment', protect, authorize('student'), confirmPayment);
router.put('/:id/progress', protect, authorize('student'), updateProgress);
router.delete('/:courseId', protect, authorize('student'), cancelEnrollment);

module.exports = router;
