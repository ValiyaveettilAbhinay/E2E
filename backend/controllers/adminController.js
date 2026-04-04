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

// New: deduplicate items by normalized name + location + category. This merges quantities into the primary item and deletes duplicates.
exports.dedupeItems = async (req, res) => {
  const items = await Item.find().lean();
  const map = new Map();

  items.forEach(it => {
    const name = (it.title || it.name || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
    const loc = (it.location || '').toLowerCase().trim();
    const cat = (it.category || '').toLowerCase().trim();
    const key = `${name}||${loc}||${cat}`;
    const arr = map.get(key) || [];
    arr.push(it);
    map.set(key, arr);
  });

  const mergedGroups = [];

  for (const [key, group] of map.entries()) {
    if (group.length <= 1) continue;

    // choose primary: the oldest createdAt (if available) or the first
    group.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    const primary = await Item.findById(group[0]._id);
    if (!primary) continue;

    // sum quantities
    const totalQty = group.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
    primary.quantity = totalQty;

    // optional: append a short note to description about merged posts
    const donorNames = Array.from(new Set(group.map(g => g.ownerName || g.owner || 'Anonymous')));
    primary.description = (primary.description || '') + `\n\n[Merged ${group.length} posts from ${donorNames.length} donors]`;

    await primary.save();

    const removed = [];
    for (let i = 1; i < group.length; i++) {
      const dup = group[i];
      // remove image file if any
      if (dup.image) {
        const p = path.join(__dirname, '..', dup.image);
        try { fs.unlinkSync(p); } catch (e) { console.warn('Failed to delete image', e); }
      }
      await Item.findByIdAndDelete(dup._id);
      removed.push(dup._id);
    }

    mergedGroups.push({ kept: primary._id, removed, totalQty });
  }

  res.json({ mergedGroups, message: 'Deduplication completed (quantities merged into primary items).' });
};

// New: list users who don't have a phone number set (for migration/cleanup)
exports.getUsersMissingPhone = async (req, res) => {
  try {
    const users = await User.find({ $or: [{ phone: { $exists: false } }, { phone: null }, { phone: '' }] }).select('name email');
    res.json({ count: users.length, users });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};

// New: migrate item.contactPhone by copying owner's phone when missing
exports.migrateItemContactPhones = async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'phone');
    let updated = 0;
    const skipped = [];

    for (const it of items) {
      if ((!it.contactPhone || it.contactPhone === '') && it.owner && it.owner.phone) {
        it.contactPhone = it.owner.phone;
        await it.save();
        updated++;
      } else {
        skipped.push(it._id);
      }
    }

    res.json({ message: 'Migration complete', updated, total: items.length, skippedCount: skipped.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};
