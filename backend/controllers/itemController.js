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

    // prefer the phone provided by the frontend; otherwise fall back to the owner's registered phone
    if (incoming.contactPhone) {
      data.contactPhone = incoming.contactPhone;
    } else {
      try {
        const owner = await User.findById(req.user.id).select('phone');
        if (owner && owner.phone) data.contactPhone = owner.phone;
      } catch (e) {
        // ignore
      }
    }

    // enforce contact phone presence
    if (!data.contactPhone) return res.status(400).json({ msg: 'Contact phone is required when posting an item' });

    // compute and store a normalized groupKey so similar items can be identified
    const normalize = (s) => (s || '').toString().toLowerCase().replace(/[^\w\s]/g, '').trim();
    data.groupKey = `${normalize(data.title)}||${normalize(data.location)}||${normalize(data.category)}`;

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
      .limit(Number(limit))
      .populate('owner', 'name email');

    // If items have a groupKey, we can also include it in the response for client-side grouping
    // (no change needed here because groupKey is part of item._doc)

    const total = await Item.countDocuments(query);

    // Check if a user is logged in (via middleware)
    const userId = req.user ? req.user.id : null;

    const itemsWithStatus = await Promise.all(items.map(async (item) => {
      let userRequestStatus = null;
      let isFavorite = false;
      let ownerName = 'Anonymous';

      // determine ownerName robustly
      if (item.owner) {
        if (typeof item.owner === 'object') {
          ownerName = item.owner.name || item.owner.email || 'Anonymous';
        } else {
          // owner stored as id string - try to load the user
          try {
            const u = await User.findById(item.owner).select('name email');
            ownerName = u ? (u.name || u.email || 'Anonymous') : 'Anonymous';
          } catch (e) {
            ownerName = 'Anonymous';
          }
        }
      }

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
        isFavorite,
        ownerName
      };
    }));

    res.json({ items: itemsWithStatus, page: Number(page), total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET SINGLE ITEM BY ID (populates owner and includes current user's request/favorite status)
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id).populate('owner', 'name email');
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const userId = req.user ? req.user.id : null;
    let userRequestStatus = null;
    let isFavorite = false;
    let ownerName = 'Anonymous';

    if (item.owner) {
      if (typeof item.owner === 'object') ownerName = item.owner.name || item.owner.email || 'Anonymous';
      else {
        const u = await User.findById(item.owner).select('name email');
        ownerName = u ? (u.name || u.email || 'Anonymous') : 'Anonymous';
      }
    }

    if (userId) {
      const existingRequest = await Request.findOne({ item: item._id, requester: userId });
      if (existingRequest) userRequestStatus = existingRequest.status;

      const user = await User.findById(userId);
      if (user) isFavorite = user.favorites.some(f => f.toString() === item._id.toString());
    }

    res.json({ ...item._doc, userRequestStatus, isFavorite, ownerName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// RECOMMENDED ITEMS (allow optional ?location= to provide desired location)
const getRecommendedItems = async (req, res) => {
  try {
    const locationQuery = req.query.location;
    const user = req.user ? await User.findById(req.user.id) : null;
    // build a minimal 'user-like' object for recommendItems
    const userContext = { location: locationQuery || (user ? user.location : undefined) };

    const items = await Item.find({ status: "available" });
    const recommended = recommendItems(items, userContext);
    res.json({ items: recommended });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { createItem, getItems, getRecommendedItems, getItemById };