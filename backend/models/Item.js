const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  quantity: Number,
  expiry: Date,
  location: String,
  image: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "available" },
  co2SavedKg: { type: Number, default: 0 },
  sharedCount: { type: Number, default: 0 },
  boostedUntil: Date,
  boostScore: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// provide a `name` alias for compatibility with frontend that uses `name`
itemSchema.virtual('name').get(function() {
  return this.title;
});

module.exports = mongoose.model("Item", itemSchema);
