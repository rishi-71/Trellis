const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { verifyToken, verifyStudent, verifyManagementOrFacultyOrAdmin } = require("../middleware/auth");

// User endpoints
router.post("/", verifyToken, complaintController.fileComplaint);
router.get("/my", verifyToken, complaintController.getMyComplaints);

// Management / Faculty / Admin endpoints
router.get("/", verifyToken, verifyManagementOrFacultyOrAdmin, complaintController.getAllComplaints);
router.put("/:id/status", verifyToken, verifyManagementOrFacultyOrAdmin, complaintController.updateComplaintStatus);
router.patch("/:id/status", verifyToken, verifyManagementOrFacultyOrAdmin, complaintController.updateComplaintStatus);

// Edit & Delete endpoints (Student owner or Management / Admin)
router.put("/:id", verifyToken, complaintController.updateComplaint);
router.patch("/:id", verifyToken, complaintController.updateComplaint);
router.delete("/:id", verifyToken, complaintController.deleteComplaint);

module.exports = router;
