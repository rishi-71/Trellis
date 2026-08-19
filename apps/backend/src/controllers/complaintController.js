const Complaint = require("../models/Complaint");

// File a complaint (Student only)
exports.fileComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    
    if (!category || !description) {
      return res.status(400).json({ success: false, message: "Category and description are required" });
    }
    
    const complaint = new Complaint({
      student: req.user.id,
      category,
      description
    });
    
    await complaint.save();
    
    res.status(201).json({ success: true, message: "Complaint filed successfully", complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current student's complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all complaints (Faculty / Admin only)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "email")
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update complaint status (Faculty / Admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    
    complaint.status = status;
    await complaint.save();
    
    res.json({ success: true, message: `Complaint status updated to ${status}`, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
