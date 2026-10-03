const Complaint = require("../models/Complaint");

// File a complaint (Student only)
exports.fileComplaint = async (req, res) => {
  try {
    const { title, location, category, issueType, description, imageUrl } = req.body;
    
    if (!title || !description || !location) {
      return res.status(400).json({ success: false, message: "Title, location, and description are required" });
    }

    const finalCategory = category || issueType || 'other';
    
    const complaint = new Complaint({
      student: req.user.id,
      title,
      location,
      category: finalCategory,
      issueType: issueType || finalCategory,
      description,
      imageUrl,
      status: 'pending'
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
    const complaints = await Complaint.find({ student: req.user.id })
      .populate("student", "email")
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all complaints (Management / Faculty / Admin)
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

// Update complaint status (Management / Faculty / Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;
    const { id } = req.params;
    
    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be pending, in_progress, or resolved" });
    }
    
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    
    complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    
    // Auto-fill title and location for legacy complaints if missing
    if (!complaint.title) {
      complaint.title = complaint.description ? (complaint.description.slice(0, 45) + (complaint.description.length > 45 ? "..." : "")) : "Facility Issue";
    }
    if (!complaint.location) {
      complaint.location = "Campus Premises";
    }
    
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }
    
    await complaint.save();
    
    res.json({ 
      success: true, 
      message: `Complaint marked as ${status === 'in_progress' ? 'Work Ongoing' : status === 'resolved' ? 'Work Completed' : 'Pending'}`, 
      complaint 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Edit / Update complaint details (Owner Student or Management / Admin)
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, category, issueType, description, imageUrl } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Permission check: owner or management/admin
    const isOwner = complaint.student.toString() === req.user.id;
    const isStaff = ['management', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this complaint" });
    }

    if (title !== undefined) complaint.title = title;
    if (location !== undefined) complaint.location = location;
    if (category !== undefined) complaint.category = category;
    if (issueType !== undefined) complaint.issueType = issueType;
    if (description !== undefined) complaint.description = description;
    if (imageUrl !== undefined) complaint.imageUrl = imageUrl;

    await complaint.save();

    res.json({ success: true, message: "Complaint updated successfully", complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete complaint (Owner Student or Management / Admin)
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Permission check: owner or management/admin
    const isOwner = complaint.student.toString() === req.user.id;
    const isStaff = ['management', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this complaint" });
    }

    await Complaint.findByIdAndDelete(id);

    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

