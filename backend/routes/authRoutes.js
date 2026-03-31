const router = require("express").Router();
const { register, login, forgotPassword, resetPassword } = require("../controllers/authController");
const passport = require('../passport');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');

router.post("/register", register);
router.post("/login", login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
});

// Google OAuth - only enable when credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    // On success, issue JWT and redirect to frontend with token in query
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/success?token=${token}`);
  });
} else {
  router.get('/google', (req, res) => res.status(501).json({ msg: 'Google OAuth not configured on server' }));
  router.get('/google/callback', (req, res) => res.status(501).json({ msg: 'Google OAuth not configured on server' }));
}

module.exports = router;
