const Item = require("../models/Item");
const User = require("../models/User");
const Request = require("../models/Request"); // Need this to check status
const { recommendItems } = require("../utils/recommend");

// CREATE ITEM (supports image upload and extra fields)
const createItem = async (req, res) => {
  try {
    // Map frontend 'name' -> model 'title' so both work
    const incoming = { ...req.body };
    if (incoming.name && !incoming.title) incoming.title = incoming.name;

    // Validate required fields
    if (!incoming.title) return res.status(400).json({ msg: 'Title is required' });

    const data = {
      title: incoming.title,
      description: incoming.description,
      category: incoming.category || 'Other',
      quantity: incoming.quantity,
      expiry: incoming.expiry,
      location: incoming.location,
      owner: req.user.id
    };

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`; // assuming static serving
    }

    const item = await Item.create(data);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL ITEMS (supports search, filter, pagination, and includes current user's request status)
const getItems = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }

    if (category) query.category = category;

    // only available items by default
    query.status = req.query.status || 'available';

    const skip = (Number(page) - 1) * Number(limit);

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);

    // Check if a user is logged in (via middleware)
    const userId = req.user ? req.user.id : null;

    const itemsWithStatus = await Promise.all(items.map(async (item) => {
      let userRequestStatus = null;
      let isFavorite = false;

      if (userId) {
        const existingRequest = await Request.findOne({ 
          item: item._id, 
          requester: userId 
        });
        if (existingRequest) userRequestStatus = existingRequest.status;

        const user = await User.findById(userId);
        if (user) isFavorite = user.favorites.some(f => f.toString() === item._id.toString());
      }

      return {
        ...item._doc,
        userRequestStatus, // 'pending', 'approved', 'rejected', or null
        isFavorite
      };
    }));

    res.json({ items: itemsWithStatus, page: Number(page), total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// RECOMMENDED ITEMS (Unchanged)
const getRecommendedItems = async (req, res) => {
  const user = await User.findById(req.user.id);
  const items = await Item.find({ status: "available" });
  const recommended = recommendItems(items, user);
  res.json(recommended);
};

module.exports = { createItem, getItems, getRecommendedItems };