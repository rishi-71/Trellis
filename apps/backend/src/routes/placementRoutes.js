const express = require("express");
const router = express.Router();
const placementController = require("../controllers/placementController");
const { verifyToken } = require("../middleware/auth");

router.post("/registration/:studentId", verifyToken, placementController.submitRegistration);
router.get("/registration/:studentId", verifyToken, placementController.getRegistration);
router.patch("/registration/:studentId/admin-edit", verifyToken, placementController.adminEditRegistration);

router.post("/jobs", verifyToken, placementController.createJobPosting);
router.get("/jobs", verifyToken, placementController.listJobPostings);
router.get("/jobs/:id/matches", verifyToken, placementController.getJobMatches);
router.post("/jobs/:id/decision", verifyToken, placementController.submitStudentDecision);
router.post("/jobs/:id/acknowledge", verifyToken, placementController.acknowledgeNotification);
router.get("/jobs/:id/report", verifyToken, placementController.generatePostDeadlineReport);
router.post("/jobs/:id/run-matching", verifyToken, placementController.runMatchingEngineEndpoint);

module.exports = router;
