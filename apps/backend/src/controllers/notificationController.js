const Notification = require("../models/Notification");
const EligibilityMatchResult = require("../models/EligibilityMatchResult");
const User = require("../models/User");

// Helper to create and emit notification via Socket.io
const dispatchNotification = async ({
  recipientRole,
  recipientId,
  source = "system",
  sentBy = null,
  type = "placement_drive",
  jobPostingId = null,
  title = null,
  message
}) => {
  try {
    const notification = new Notification({
      recipientRole,
      recipientId,
      source,
      sentBy,
      type,
      jobPostingId,
      title,
      message,
      isRead: false
    });
    await notification.save();

    // Real-time broadcast if socket is connected
    if (global.io) {
      global.io.to(recipientId.toString()).emit("notification:new", notification);
      User.findById(recipientId).select("email").then(u => {
        if (u && u.email && global.io) {
          global.io.to(u.email).emit("notification:new", notification);
        }
      }).catch(() => {});
    }
    return notification;
  } catch (err) {
    console.error("Error dispatching notification:", err);
    return null;
  }
};

// 1. Get all notifications for current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, limit = 50 } = req.query;

    const filter = { recipientId: userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const notifications = await Notification.find(filter)
      .populate("jobPostingId", "companyName role applicationDeadline")
      .populate("sentBy", "email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Get unread count only
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Faculty / Admin sends custom alert to students (e.g., all eligible students of a drive)
exports.sendFacultyAlert = async (req, res) => {
  try {
    const { jobPostingId, message, studentId, targetAllEligible } = req.body;
    const senderId = req.user.id;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message text is required." });
    }

    const createdNotifications = [];

    if (targetAllEligible && jobPostingId) {
      // Find all eligible students for this drive
      const matches = await EligibilityMatchResult.find({
        jobPostingId,
        isEligible: true
      });

      for (const match of matches) {
        const isAlreadyApplied = match.studentDecision === "applied";
        const studentMsg = isAlreadyApplied
          ? `You are already registered for this drive. Note: ${message}`
          : message;

        const notif = await dispatchNotification({
          recipientRole: "student",
          recipientId: match.studentId,
          source: "faculty",
          sentBy: senderId,
          type: "custom_alert",
          jobPostingId,
          message: studentMsg
        });
        if (notif) createdNotifications.push(notif);
      }
    } else if (studentId) {
      const match = await EligibilityMatchResult.findOne({
        jobPostingId,
        studentId
      });
      const isAlreadyApplied = match?.studentDecision === "applied";
      const studentMsg = isAlreadyApplied
        ? `You are already registered for this drive. Note: ${message}`
        : message;

      const notif = await dispatchNotification({
        recipientRole: "student",
        recipientId,
        source: "faculty",
        sentBy: senderId,
        type: "custom_alert",
        jobPostingId: jobPostingId || null,
        message: studentMsg
      });
      if (notif) createdNotifications.push(notif);
    } else {
      return res.status(400).json({
        success: false,
        message: "Specify either targetAllEligible with jobPostingId or studentId."
      });
    }

    res.json({
      success: true,
      message: `Alert sent to ${createdNotifications.length} student(s).`,
      count: createdNotifications.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  dispatchNotification,
  getUserNotifications: exports.getUserNotifications,
  getUnreadCount: exports.getUnreadCount,
  markAsRead: exports.markAsRead,
  markAllAsRead: exports.markAllAsRead,
  sendFacultyAlert: exports.sendFacultyAlert
};
