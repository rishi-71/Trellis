const express = require("express");
const router = express.Router();
const placementController = require("../controllers/placementController");
const { verifyToken } = require("../middleware/auth");

router.get("/registrations", verifyToken, placementController.listAllRegistrations);
router.get("/registration/all", verifyToken, placementController.listAllRegistrations);
router.post("/registration/:studentId", verifyToken, placementController.submitRegistration);
router.get("/registration/:studentId", verifyToken, placementController.getRegistration);
router.put("/registration/:studentId/student-update", verifyToken, placementController.updateStudentResumeAndCgpa);
router.patch("/registration/:studentId/admin-edit", verifyToken, placementController.adminEditRegistration);

router.post("/jobs", verifyToken, placementController.createJobPosting);
router.get("/jobs", verifyToken, placementController.listJobPostings);
router.put("/jobs/:id", verifyToken, placementController.updateJobPosting);
router.delete("/jobs/:id", verifyToken, placementController.deleteJobPosting);
router.get("/jobs/:id/matches", verifyToken, placementController.getJobMatches);
router.post("/jobs/:id/decision", verifyToken, placementController.submitStudentDecision);
router.get("/jobs/:id/report", verifyToken, placementController.generatePostDeadlineReport);
router.post("/jobs/:id/report", verifyToken, placementController.generatePostDeadlineReport);
router.put("/jobs/:id/attach-resume", verifyToken, placementController.attachDriveSpecificResume);
router.post("/jobs/:id/run-matching", verifyToken, placementController.runMatchingEngineEndpoint);

// Faculty Broadcasts & Student Activity Feed routes
router.post("/broadcasts/send", verifyToken, placementController.sendPlacementBroadcast);
router.get("/broadcasts", verifyToken, placementController.getPlacementBroadcasts);
router.get("/activity-feed", verifyToken, placementController.getPlacementActivityFeed);

module.exports = router;
