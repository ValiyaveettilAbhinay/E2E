const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getMyItems } = require('../controllers/userController');

router.get('/my-items', auth, getMyItems);

module.exports = router;