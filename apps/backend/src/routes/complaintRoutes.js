const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { verifyToken, verifyStudent, verifyFacultyOrAdmin } = require("../middleware/auth");

// Student endpoints
router.post("/", verifyToken, verifyStudent, complaintController.fileComplaint);
router.get("/my", verifyToken, verifyStudent, complaintController.getMyComplaints);

// Faculty / Admin endpoints
router.get("/", verifyToken, verifyFacultyOrAdmin, complaintController.getAllComplaints);
router.put("/:id/status", verifyToken, verifyFacultyOrAdmin, complaintController.updateComplaintStatus);

module.exports = router;
