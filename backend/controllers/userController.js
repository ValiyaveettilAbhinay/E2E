const User = require('../models/User');
const Item = require('../models/Item');
const Request = require('../models/Request');

exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  if (!user.favorites) user.favorites = [];
  if (!user.favorites.includes(itemId)) {
    user.favorites.push(itemId);
    await user.save();
  }

  res.json({ msg: 'Added to favorites' });
};

exports.removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  user.favorites = user.favorites.filter(f => f.toString() !== itemId.toString());
  await user.save();

  res.json({ msg: 'Removed from favorites' });
};

exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const donated = await Item.find({ owner: userId }).sort({ createdAt: -1 });

    const approvedRequests = await Request.find({ requester: userId, status: 'approved' }).populate('item');
    const received = approvedRequests.map(r => r.item).filter(Boolean);

    res.json({ donated, received });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};
