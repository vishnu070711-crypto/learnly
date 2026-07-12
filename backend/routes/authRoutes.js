const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload, enforceSizeLimits } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('avatar'), enforceSizeLimits, updateMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
