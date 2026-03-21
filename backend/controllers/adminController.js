const User = require("../models/User");
const Item = require("../models/Item");
const fs = require('fs');
const path = require('path');

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getAllItems = async (req, res) => {
  const items = await Item.find().populate("owner", "name email");
  res.json(items);
};

exports.deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ msg: 'Not found' });

  if (item.image) {
    const p = path.join(__dirname, '..', item.image);
    fs.unlink(p, (err) => { if (err) console.warn('Failed to delete image', err); });
  }

  await Item.findByIdAndDelete(req.params.id);
  res.json({ msg: "Item removed by admin" });
};
