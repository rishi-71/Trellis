const Notice = require("../models/Notice");

// Create notice (Faculty/Admin only)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: "Title, content and category are required" });
    }
    
    const notice = new Notice({
      title,
      content,
      category,
      author: req.user.id
    });
    
    await notice.save();
    
    res.status(201).json({ success: true, message: "Notice published successfully", notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all notices
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().populate("author", "email").sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
