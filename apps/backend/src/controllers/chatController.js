const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");

// Helper function to attach profiles to participants in a conversation
const attachProfilesToConversation = async (conversation) => {
  const convObj = conversation.toObject();
  const participantsWithProfiles = [];

  for (const participant of convObj.participants) {
    const profile = await StudentProfile.findOne({ user: participant._id }).select("name photoUrl");
    participantsWithProfiles.push({
      _id: participant._id,
      email: participant.email,
      role: participant.role,
      name: profile ? profile.name : participant.email.split("@")[0],
      photoUrl: profile ? profile.photoUrl : ""
    });
  }

  convObj.participants = participantsWithProfiles;
  return convObj;
};

// 1. GET ALL CONVERSATIONS
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "email role")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "email" }
      })
      .sort({ lastMessageAt: -1 });

    const enrichedConversations = [];
    for (const conv of conversations) {
      const enriched = await attachProfilesToConversation(conv);
      enrichedConversations.push(enriched);
    }

    res.json({ success: true, conversations: enrichedConversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. CREATE OR FETCH 1-TO-1 CONVERSATION
exports.createConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ success: false, message: "You cannot start a chat with yourself" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      // Ensure it is 1-to-1 conversation by checking participants length
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    }).populate("participants", "email role");

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId]
      });
      await conversation.save();
      // Populate participants after saving
      await conversation.populate("participants", "email role");
    }

    const enriched = await attachProfilesToConversation(conversation);
    res.status(201).json({ success: true, conversation: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. GET MESSAGES OF A CONVERSATION
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied. You are not a participant in this conversation." });
    }

    const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. SEND MESSAGE IN A CONVERSATION
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { id } = req.params;
    const { message, messageType = "text" } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ success: false, message: "Access denied. You are not a participant in this conversation." });
    }

    const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());
    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Recipient participant not found in conversation" });
    }

    const newMessage = new Message({
      conversationId: id,
      senderId,
      receiverId,
      message,
      messageType
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Trigger Socket.IO real-time notification if socket is connected
    if (global.io) {
      const room = id.toString();
      // Emit to conversation room
      global.io.to(room).emit("message:new", newMessage);
      
      // Emit notification to user private room for unread count increment
      global.io.to(receiverId.toString()).emit("notification:new", {
        type: "message",
        message: `New message from ${req.user.email}`,
        conversationId: id
      });
      
      // Emit conversation:updated to participants so list re-orders
      global.io.to(senderId.toString()).emit("conversation:updated", conversation);
      global.io.to(receiverId.toString()).emit("conversation:updated", conversation);
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. MARK MESSAGES AS READ
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied. You are not a participant in this conversation." });
    }

    // Mark messages sent by others in this conversation as read
    await Message.updateMany(
      { conversationId: id, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    if (global.io) {
      global.io.to(id.toString()).emit("message:read", { conversationId: id, readerId: userId });
    }

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
