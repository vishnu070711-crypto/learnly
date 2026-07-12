const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload, enforceSizeLimits } = require('../middleware/upload');

router.get('/single/:id', protect, getAssignmentById);
router.get('/:courseId', protect, getCourseAssignments);
router.post('/:courseId', protect, authorize('instructor', 'admin'), createAssignment);

router.post(
  '/submit/:assignmentId',
  protect,
  authorize('student'),
  upload.single('file'),
  enforceSizeLimits,
  submitAssignment
);
router.get('/:assignmentId/submissions', protect, authorize('instructor', 'admin'), getSubmissions);
router.get('/:assignmentId/my-submission', protect, authorize('student'), getMySubmission);
router.put('/submissions/:submissionId/grade', protect, authorize('instructor', 'admin'), gradeSubmission);

module.exports = router;
