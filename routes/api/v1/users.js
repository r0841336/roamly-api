const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  updateMe,
  forgotPassword,
  resetPassword,
  verifyResetCode,
  getProfilePicture,
  updateProfilePicture,
  setProfilePicture,
} = require('../../../controllers/api/v1/Users');

const authenticate = require('../../../middleware/Authentication');
const User = require('../../../models/api/v1/User');

// 🧠 Auth routes
router.post('/register', register);
router.post('/login', login);

// 🔐 Protected profile routes
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateMe); // ✅ THIS IS THE MISSING ROUTE

// 🔄 Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-code', verifyResetCode);

// 🖼️ Profile picture handling
router.get('/users/profile-picture', authenticate, getProfilePicture);
router.post('/users/profile-picture', authenticate, setProfilePicture);
router.put('/users/profile-picture', authenticate, updateProfilePicture);

// 🔍 Admin route (if needed)
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Er is een fout opgetreden bij het ophalen van de gebruikers.',
      error: error.message,
    });
  }
});

module.exports = router;
