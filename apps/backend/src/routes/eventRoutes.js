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
router.get("/:id/participants", verifyToken, verifyFacultyOrAdmin, eventController.getEventParticipants);
router.post("/:id/attendance", verifyToken, verifyFacultyOrAdmin, eventController.markAttendance);
router.post("/:id/winners", verifyToken, verifyFacultyOrAdmin, eventController.announceEventWinners);
router.get("/:id/winners/csv", verifyToken, verifyFacultyOrAdmin, eventController.downloadWinnersCSV);
router.put("/:id/poster", verifyToken, verifyFacultyOrAdmin, eventController.updateEventPoster);
router.delete("/:id", verifyToken, verifyFacultyOrAdmin, eventController.deleteEvent);

module.exports = router;
