const Activity = require("../models/Activity");

// Log co-curricular activity (Student only)
exports.logActivity = async (req, res) => {
  try {
    const { type, title, description, date, certificateUrl } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({ success: false, message: "Type and title are required" });
    }
    
    const activity = new Activity({
      student: req.user.id,
      type,
      title,
      description,
      date,
      certificateUrl
    });
    
    await activity.save();
    
    res.status(201).json({ success: true, message: "Activity logged and pending verification", activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current student's activities
exports.getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ student: req.user.id }).populate("verifiedBy", "email");
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pending activities for verification (Faculty/Admin only)
exports.getPendingActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ verificationStatus: "pending" })
      .populate("student", "email")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify/Reject activity (Faculty/Admin only)
exports.verifyActivity = async (req, res) => {
  try {
    const { status, pointsAwarded } = req.body; // status: 'verified' or 'rejected'
    const { id } = req.params;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid verification status. Must be 'verified' or 'rejected'" });
    }
    
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity record not found" });
    }
    
    if (activity.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: "This activity has already been verified" });
    }
    
    activity.verificationStatus = status;
    activity.verifiedBy = req.user.id;
    if (status === 'verified') {
      activity.pointsAwarded = pointsAwarded || 10; // Default 10 points
    } else {
      activity.pointsAwarded = 0;
    }
    
    await activity.save();
    
    res.json({ success: true, message: `Activity status updated to ${status}`, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
