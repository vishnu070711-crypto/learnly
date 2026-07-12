const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getPlatformStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/stats/overview', protect, authorize('admin'), getPlatformStats);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
