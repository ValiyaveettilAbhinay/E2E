const Item = require("../models/Item");
const Request = require("../models/Request");
const User = require("../models/User");

exports.getDashboardData = async (req, res) => {
  const userId = req.user.id;

  const postedItems = await Item.countDocuments({ owner: userId });
  const exchangedItems = await Item.countDocuments({
    owner: userId,
    status: "exchanged"
  });

  const requestsSent = await Request.countDocuments({ requester: userId });

  const user = await User.findById(userId).select('-password');

  // simple leaderboard (top 5 by monthlyPoints)
  const leaderboard = await User.find().sort({ monthlyPoints: -1 }).limit(5).select('name monthlyPoints badges');

  res.json({
    postedItems,
    exchangedItems,
    requestsSent,
    wasteReduced: exchangedItems * 1, // 1 unit per item (dummy metric)
    karmaPoints: user.karmaPoints || 0,
    badges: user.badges || [],
    leaderboard
  });
};
