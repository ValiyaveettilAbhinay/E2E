const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardController");

router.get("/", auth, getDashboardData);

module.exports = router;
