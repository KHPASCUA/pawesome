const express = require("express");
const router = express.Router();
const receptionistController = require("../controllers/receptionistController");

router.get("/requests", receptionistController.getRequests);
router.put("/requests/:id/approve", receptionistController.approveRequest);
router.put("/requests/:id/reject", receptionistController.rejectRequest);
router.put("/requests/:id/reschedule", receptionistController.rescheduleRequest);

module.exports = router;
