// Simple gamification utilities

const BADGE_RULES = [
  { id: 'zero_waste_hero', name: 'Zero Waste Hero', check: (user) => user.sharedFoodCount >= 10 },
  { id: 'tool_master', name: 'Tool Master', check: (user) => user.sharedToolCount >= 5 }
];

const categoryCo2 = {
  "Food": 2.0, // kg CO2 per share (example)
  "Clothing": 1.5,
  "Household": 0.8,
  "Other": 0.5
};

function estimateCo2ForItem(item) {
  return categoryCo2[item.category] || 0.5;
}

module.exports = { BADGE_RULES, estimateCo2ForItem };
