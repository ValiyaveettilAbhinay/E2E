const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "pending" },
  // whether the requester asked the owner to reveal their phone
  revealRequested: { type: Boolean, default: false },
  // whether the owner approved revealing their phone to the requester
  revealApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
