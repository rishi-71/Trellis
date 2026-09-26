const Event = require("../models/Event");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

// Create event (Faculty / Admin only)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, registrationDeadline, maxParticipants, posterUrl } = req.body;
    
    if (!title || !description || !date || !venue || !registrationDeadline) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    
    const event = new Event({
      title,
      description,
      organizer: req.user.id,
      date,
      venue,
      registrationDeadline,
      maxParticipants,
      posterUrl
    });
    
    await event.save();
    
    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "email");
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single event details
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "email")
      .populate("registeredParticipants", "email")
      .populate("attendedParticipants", "email");
      
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Register for an event (Student only)
exports.registerForEvent = async (req, res) => {
  try {
    const { contact, name, rollNumber, branch, semester } = req.body || {};
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check registration deadline
    const deadline = new Date(event.registrationDeadline);
    if (deadline.getHours() === 0 && deadline.getMinutes() === 0 && deadline.getSeconds() === 0) {
      deadline.setHours(23, 59, 59, 999);
    }
    if (new Date() > deadline) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed" });
    }
    
    // Check capacity
    if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: "Event is fully registered" });
    }
    
    // Check if already registered
    const alreadyRegistered = (event.registeredParticipants || []).some(id => id.toString() === req.user.id.toString());
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: "You are already registered for this event" });
    }
    
    // Update or ensure StudentProfile has contact and details
    if (contact) {
      await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: { contact: contact.trim() } }
      );
    }
    if (name || rollNumber || branch) {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (rollNumber) updateFields.rollNumber = rollNumber;
      if (branch) updateFields.branch = branch;
      if (semester) updateFields.semester = parseInt(semester.toString());
      await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: updateFields }
      );
    }
    
    event.registeredParticipants.push(req.user.id);
    await event.save();
    
    res.json({ success: true, message: "Registered for event successfully", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get registered participants for an event (Faculty / Admin only)
exports.getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const isOrganizer = event.organizer && event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isFaculty = req.user.role === "faculty";

    if (!isOrganizer && !isAdmin && !isFaculty) {
      return res.status(403).json({ success: false, message: "Access restricted to event faculty and administrators" });
    }

    const userIds = event.registeredParticipants || [];
    const attendedSet = new Set((event.attendedParticipants || []).map(id => id.toString()));

    // Lookup StudentProfiles
    const profiles = await StudentProfile.find({ user: { $in: userIds } }).populate("user", "email");

    const registeredUsersMap = new Map();
    profiles.forEach(p => {
      const uId = p.user?._id?.toString() || p.user?.toString();
      if (uId) {
        registeredUsersMap.set(uId, {
          userId: uId,
          profileId: p._id,
          name: p.name,
          rollNumber: p.rollNumber,
          email: p.user?.email || "",
          branch: p.branch,
          semester: p.semester || 1,
          contact: p.contact || "",
          attended: attendedSet.has(uId)
        });
      }
    });

    // Handle any users without a completed StudentProfile
    const missingUserIds = userIds.filter(id => !registeredUsersMap.has(id.toString()));
    if (missingUserIds.length > 0) {
      const users = await User.find({ _id: { $in: missingUserIds } }).select("email");
      users.forEach(u => {
        const uId = u._id.toString();
        registeredUsersMap.set(uId, {
          userId: uId,
          profileId: null,
          name: u.email.split("@")[0],
          rollNumber: "N/A",
          email: u.email,
          branch: "General",
          semester: 1,
          contact: "",
          attended: attendedSet.has(uId)
        });
      });
    }

    // Preserve registration order
    const participants = userIds
      .map(id => registeredUsersMap.get(id.toString()))
      .filter(Boolean);

    res.json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        maxParticipants: event.maxParticipants,
        totalRegistered: participants.length,
        totalAttended: event.attendedParticipants?.length || 0
      },
      participants
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark / Toggle event attendance (Faculty/Admin only)
exports.markAttendance = async (req, res) => {
  try {
    const { studentId } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Verify student is registered
    const isRegistered = (event.registeredParticipants || []).some(id => id.toString() === studentId.toString());
    if (!isRegistered) {
      return res.status(400).json({ success: false, message: "Student is not registered for this event" });
    }
    
    // Toggle attendance
    const isAttended = (event.attendedParticipants || []).some(id => id.toString() === studentId.toString());
    if (isAttended) {
      event.attendedParticipants = event.attendedParticipants.filter(id => id.toString() !== studentId.toString());
      await event.save();
      return res.json({ success: true, message: "Attendance unmarked", attended: false, event });
    }
    
    event.attendedParticipants.push(studentId);
    await event.save();
    
    res.json({ success: true, message: "Attendance marked successfully", attended: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete event (Faculty who organized it / Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Admins can delete any event; faculty can only delete events they published
    if (req.user.role === "faculty") {
      const organizerId = event.organizer ? event.organizer.toString() : null;
      if (organizerId && organizerId !== req.user.id) {
        return res.status(403).json({ success: false, message: "You can only delete events that you published" });
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

