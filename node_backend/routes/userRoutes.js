const express = require('express');
const router = express.Router();
const {
  getUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.get('/admin/users', protect, admin, getUsers);
router.delete('/admin/users/:id', protect, admin, deleteUser);
router.patch('/admin/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
