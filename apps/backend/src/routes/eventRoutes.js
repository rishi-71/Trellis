const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { verifyToken, verifyFacultyOrAdmin, verifyStudent } = require("../middleware/auth");

// Public event listing / details
router.get("/", verifyToken, eventController.getAllEvents);
router.get("/:id", verifyToken, eventController.getEventById);

// Student registration
router.post("/:id/register", verifyToken, verifyStudent, eventController.registerForEvent);

// Faculty / Admin operations
router.post("/", verifyToken, verifyFacultyOrAdmin, eventController.createEvent);
router.post("/:id/attendance", verifyToken, verifyFacultyOrAdmin, eventController.markAttendance);

module.exports = router;
