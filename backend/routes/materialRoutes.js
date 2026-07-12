const express = require('express');
const router = express.Router();
const { uploadMaterial, getCourseMaterials, deleteMaterial } = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload, enforceSizeLimits } = require('../middleware/upload');

router.get('/:courseId', protect, getCourseMaterials);
router.post(
  '/:courseId',
  protect,
  authorize('instructor', 'admin'),
  upload.single('file'),
  enforceSizeLimits,
  uploadMaterial
);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteMaterial);

module.exports = router;
