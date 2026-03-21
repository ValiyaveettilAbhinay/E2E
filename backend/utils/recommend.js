exports.recommendItems = (items, user) => {
  return items
    .filter(i => i.location === user.location)
    .sort((a, b) => {
      if (!a.expiry || !b.expiry) return 0;
      return new Date(a.expiry) - new Date(b.expiry);
    });
};
