const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/auth");

// Chat features endpoints
router.get("/conversations", verifyToken, chatController.getConversations);
router.post("/conversations", verifyToken, chatController.createConversation);
router.get("/conversations/:id/messages", verifyToken, chatController.getMessages);
router.post("/conversations/:id/messages", verifyToken, chatController.sendMessage);
router.patch("/conversations/:id/read", verifyToken, chatController.markAsRead);

module.exports = router;
