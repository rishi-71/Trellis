const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");
const { verifyToken, verifyFacultyOrAdmin } = require("../middleware/auth");

// Public listing (accessible to all authenticated users)
router.get("/", verifyToken, noticeController.getAllNotices);

// Create notice (Faculty/Admin only)
router.post("/", verifyToken, verifyFacultyOrAdmin, noticeController.createNotice);

module.exports = router;
