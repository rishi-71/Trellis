const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken, verifyFacultyOrAdmin } = require("../middleware/auth");

// Student & all users: fetch notifications and manage read status
router.get("/", verifyToken, notificationController.getUserNotifications);
router.get("/unread-count", verifyToken, notificationController.getUnreadCount);
router.patch("/read-all", verifyToken, notificationController.markAllAsRead);
router.patch("/:id/read", verifyToken, notificationController.markAsRead);

// Faculty & Admin: Send broadcast/custom alert to eligible students or individual student
router.post("/send", verifyToken, verifyFacultyOrAdmin, notificationController.sendFacultyAlert);

module.exports = router;
