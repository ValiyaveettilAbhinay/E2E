const User = require('../models/User');
const Item = require('../models/Item');

exports.spendKarmaToBoost = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const cost = Number(req.body.cost) || 10; // default cost
    const boostMinutes = Number(req.body.minutes) || 60; // default boost duration

    if (cost <= 0 || boostMinutes <= 0) {
      return res.status(400).json({ msg: 'Invalid cost or duration' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if ((user.karmaPoints || 0) < cost) return res.status(400).json({ msg: 'Not enough karma' });

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // safe owner id extraction (handles populated or raw ObjectId)
    const ownerId = item.owner && item.owner.toString ? item.owner.toString() : (item.owner && item.owner._id ? item.owner._id.toString() : String(item.owner));
    if (ownerId !== String(userId)) return res.status(403).json({ msg: 'Not authorized' });

    // Deduct karma and apply boost
    user.karmaPoints -= cost;
    await user.save();

    item.boostedUntil = new Date(Date.now() + boostMinutes * 60000);
    item.boostScore = (item.boostScore || 0) + cost;
    await item.save();

    res.json({ msg: 'Boost applied', boostedUntil: item.boostedUntil, karma: user.karmaPoints, boostScore: item.boostScore });
  } catch (err) {
    console.error('Error in spendKarmaToBoost:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUserKarma = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('karmaPoints badges monthlyPoints');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error in getUserKarma:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
