const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const {
  createItem,
  getItems,
  getRecommendedItems
} = require("../controllers/itemController");

// public listing - optional auth
router.get("/", optionalAuth, getItems);
router.post("/", auth, upload.single('image'), createItem);
router.get("/recommend", auth, getRecommendedItems);

// favorite endpoints
const userController = require('../controllers/userController');
router.post('/favorite/:id', auth, userController.addFavorite);
router.delete('/favorite/:id', auth, userController.removeFavorite);

// karma/boost endpoints
const karmaController = require('../controllers/karmaController');
router.post('/boost/:id', auth, karmaController.spendKarmaToBoost);
router.get('/karma/me', auth, karmaController.getUserKarma);

module.exports = router;
