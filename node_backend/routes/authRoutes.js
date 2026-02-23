const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/user', protect, getUserProfile);
router.post('/user/profile', protect, updateUserProfile);

// Additional routes for consistency
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.post('/user/change-password', protect, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const user = req.user;
  
  // Re-fetch user to get password
  const userToUpdate = await require('../models/User').findById(user._id);

  if (userToUpdate && (await userToUpdate.matchPassword(current_password))) {
    userToUpdate.password = new_password;
    await userToUpdate.save();
    res.json({ message: 'Password changed successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid current password');
  }
}));

module.exports = router;
