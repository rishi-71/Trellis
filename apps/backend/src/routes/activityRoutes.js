const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { verifyToken, verifyStudent, verifyFacultyOrAdmin } = require("../middleware/auth");

// Student operations
router.post("/", verifyToken, verifyStudent, activityController.logActivity);
router.get("/my", verifyToken, verifyStudent, activityController.getMyActivities);

// Faculty / Admin operations
router.get("/pending", verifyToken, verifyFacultyOrAdmin, activityController.getPendingActivities);
router.post("/:id/verify", verifyToken, verifyFacultyOrAdmin, activityController.verifyActivity);

module.exports = router;
