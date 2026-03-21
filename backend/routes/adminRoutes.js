const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getAllItems,
  deleteItem
} = require("../controllers/adminController");

router.get("/users", auth, admin, getAllUsers);
router.get("/items", auth, admin, getAllItems);
router.delete("/item/:id", auth, admin, deleteItem);

module.exports = router;
