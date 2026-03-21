const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

// Initialize Google strategy only when client ID/secret are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      const name = profile.displayName || (profile.name && `${profile.name.givenName} ${profile.name.familyName}`) || 'Google User';

      if (!email) return done(new Error('No email in Google profile'));

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email, password: 'google-auth', location: '' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
} else {
  console.warn('Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
}

module.exports = passport;
