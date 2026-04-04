const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getAllItems,
  deleteItem,
  dedupeItems,
  getUsersMissingPhone,
  migrateItemContactPhones
} = require("../controllers/adminController");

router.get("/users", auth, admin, getAllUsers);
router.get("/items", auth, admin, getAllItems);
router.delete("/item/:id", auth, admin, deleteItem);
// run server-side deduplication (merges duplicates into primary items) - admin only
router.post('/dedupe', auth, admin, dedupeItems);
router.get('/missing-phones', auth, admin, getUsersMissingPhone);
router.post('/migrate-item-phones', auth, admin, migrateItemContactPhones);

module.exports = router;
