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
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const notices = await Notice.find(filter).populate("author", "email").sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete notice (Author or Admin)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    const isAuthor = notice.author && notice.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this notice" });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

