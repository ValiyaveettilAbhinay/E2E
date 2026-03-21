const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
