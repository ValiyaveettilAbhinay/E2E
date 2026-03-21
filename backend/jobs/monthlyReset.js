const User = require('../models/User');

async function resetMonthlyPoints() {
  try {
    await User.updateMany({}, { $set: { monthlyPoints: 0 } });
    console.log('Monthly points reset');
  } catch (e) {
    console.error('Failed to reset monthly points', e);
  }
}

module.exports = resetMonthlyPoints;
