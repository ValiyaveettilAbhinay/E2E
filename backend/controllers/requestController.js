const Request = require("../models/Request");
const Item = require("../models/Item");
const User = require("../models/User");
const nodemailer = require('nodemailer');
const { estimateCo2ForItem, BADGE_RULES } = require('../utils/gamification');

// utility to send email - uses SMTP configured via env
const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.SMTP_HOST) return; // skip if not configured
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });

  await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@example.com', to, subject, text });
};

// Send request for an item
exports.sendRequest = async (req, res) => {
  const { itemId } = req.body;
  const userId = req.user.id; // From your auth middleware

  try {
    const item = await Item.findById(itemId).populate('owner');
    
    if (!item || item.status !== "available") {
      return res.status(400).json({ msg: "Item not available" });
    }

    // --- NEW: Prevent owner from claiming their own item ---
    if (item.owner._id.toString() === userId) {
      return res.status(400).json({ msg: "You cannot claim your own resource" });
    }

    // --- OPTIONAL: Prevent duplicate requests ---
    const existingRequest = await Request.findOne({ item: itemId, requester: userId });
    if (existingRequest) {
      return res.status(400).json({ msg: "You have already requested this item" });
    }

    const request = await Request.create({
      item: itemId,
      requester: userId
    });

    // notify owner via email
    try {
      const owner = await User.findById(item.owner._id);
      if (owner && owner.email) {
        await sendEmail({ to: owner.email, subject: 'New request for your item', text: `Your item ${item.title} has a new request.` });
      }
    } catch (e) {
      console.error('Email send failed', e);
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// List pending requests for item (owner only)
exports.getPendingRequestsForItem = async (req, res) => {
  const itemId = req.params.id;
  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ msg: 'Item not found' });
  if (item.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

  const requests = await Request.find({ item: itemId, status: 'pending' }).sort({ createdAt: 1 }).populate('requester');
  res.json(requests);
};

// New: Get incoming requests for all items owned by the user
exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Item.find({ owner: userId }).select('_id title');
    const itemIds = items.map(i => i._id);

    const requests = await Request.find({ item: { $in: itemIds }, status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('item requester');

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Owner accepts earliest pending request for item (first-come-first-serve) or specific requestId
exports.acceptRequest = async (req, res) => {
  const { itemId, requestId } = req.body;

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ msg: 'Item not found' });
  if (item.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

  // find earliest pending request
  const request = requestId
    ? await Request.findById(requestId).populate('requester').populate('item')
    : await Request.findOne({ item: itemId, status: 'pending' }).sort({ createdAt: 1 }).populate('requester').populate('item');

  if (!request) return res.status(404).json({ msg: 'No pending requests' });

  // mark approved
  request.status = 'approved';
  await request.save();

  // mark item exchanged and update stats
  request.item.status = 'exchanged';
  request.item.sharedCount = (request.item.sharedCount || 0) + 1;
  await request.item.save();

  // award karma and badges
  const co2 = estimateCo2ForItem(request.item);
  request.item.co2SavedKg = (request.item.co2SavedKg || 0) + co2;

  const owner = await User.findById(request.item.owner);
  if (owner) {
    owner.karmaPoints = (owner.karmaPoints || 0) + Math.round(co2 * 10);
    owner.monthlyPoints = (owner.monthlyPoints || 0) + Math.round(co2 * 10);
    owner.sharedFoodCount = (owner.sharedFoodCount || 0) + (request.item.category === 'Food' ? 1 : 0);
    owner.sharedToolCount = (owner.sharedToolCount || 0) + (request.item.category === 'Tool' ? 1 : 0);

    const badges = owner.badges || [];
    if (owner.sharedFoodCount >= 10 && !badges.includes('Zero Waste Hero')) badges.push('Zero Waste Hero');
    if (owner.sharedToolCount >= 5 && !badges.includes('Tool Master')) badges.push('Tool Master');

    owner.badges = badges;
    await owner.save();
  }

  // notify requester via email
  try {
    if (request.requester && request.requester.email) {
      await sendEmail({ to: request.requester.email, subject: 'Request approved', text: `Your request for ${request.item.title} was approved.` });
    }
  } catch (e) { console.error('Email failed', e); }

  // reject remaining pending requests for this item (optional)
  await Request.updateMany({ item: itemId, status: 'pending' }, { $set: { status: 'rejected' } });

  res.json({ msg: 'Request approved', request });
};

// Reject a single request
exports.rejectRequest = async (req, res) => {
  const { requestId } = req.body;
  const request = await Request.findById(requestId).populate('item');
  if (!request) return res.status(404).json({ msg: 'Request not found' });
  if (request.item.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

  request.status = 'rejected';
  await request.save();

  // notify requester
  try {
    const requester = await User.findById(request.requester);
    if (requester && requester.email) await sendEmail({ to: requester.email, subject: 'Request rejected', text: `Your request for ${request.item.title} was rejected.` });
  } catch (e) { console.error('Email failed', e); }

  res.json({ msg: 'Request rejected' });
};

// View my requests
exports.getMyRequests = async (req, res) => {
  const requests = await Request.find({ requester: req.user.id })
    .populate("item");

  res.json(requests);
};
