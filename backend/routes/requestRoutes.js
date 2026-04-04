const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  sendRequest,
  getMyRequests,
  getPendingRequestsForItem,
  acceptRequest,
  rejectRequest,
  getIncomingRequests,
  requestReveal,
  approveReveal
} = require("../controllers/requestController");

router.post("/send", auth, sendRequest);
router.get("/my", auth, getMyRequests);

// owner endpoints
router.get('/pending/:id', auth, getPendingRequestsForItem);
router.get('/incoming', auth, getIncomingRequests);
router.post('/accept', auth, acceptRequest);
router.post('/reject', auth, rejectRequest);
router.post('/request-reveal', auth, requestReveal);
router.post('/approve-reveal', auth, approveReveal);

module.exports = router;
