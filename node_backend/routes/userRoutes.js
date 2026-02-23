const express = require('express');
const router = express.Router();
const {
  getUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);
router.patch('/:id/role', protect, admin, updateUserRole);

module.exports = router;
