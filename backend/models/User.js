const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String },
  password: String,
  role: { type: String, default: "user" },
  location: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],

  // Gamification fields
  karmaPoints: { type: Number, default: 0 },
  badges: [{ type: String }],
  streak: {
    lastSharedAt: Date,
    currentStreak: { type: Number, default: 0 }
  },
  monthlyPoints: { type: Number, default: 0 },

  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model("User", userSchema);
