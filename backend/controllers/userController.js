const User = require('../models/User');

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
