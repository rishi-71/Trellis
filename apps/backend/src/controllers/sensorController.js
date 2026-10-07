const Sensor = require("../models/Sensor");
const SensorRequest = require("../models/SensorRequest");
const Fine = require("../models/Fine");
const DamageLossCase = require("../models/DamageLossCase");
const FineConfig = require("../models/FineConfig");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper to safely notify students via in-app notification center
const sendStudentNotification = async ({ studentId, studentEmail, title, message }) => {
  try {
    let targetId = studentId;
    if (!targetId && studentEmail) {
      const u = await User.findOne({ email: studentEmail });
      if (u) targetId = u._id;
    }
    if (targetId) {
      await Notification.create({
        recipientRole: "student",
        recipientId: targetId,
        source: "faculty",
        type: "sensor_loan",
        title,
        message
      });
    }
  } catch (err) {
    console.log("Sensor notification dispatch error:", err.message);
  }
};

// 1. SENSOR CATALOG ENDPOINTS
exports.listSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json({ success: true, sensors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSensor = async (req, res) => {
  try {
    const { name, type, department, totalQuantity } = req.body;
    if (!name || !type || !department || totalQuantity === undefined) {
      return res.status(400).json({ success: false, message: "Missing required catalog fields." });
    }

    const sensor = new Sensor({
      name,
      type,
      department,
      totalQuantity,
      availableQuantity: totalQuantity,
      conditionSummary: "working"
    });

    await sensor.save();
    res.status(201).json({ success: true, message: "Sensor added successfully.", sensor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalQuantity, availableQuantity, conditionSummary, notes } = req.body;

    const sensor = await Sensor.findById(id);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Sensor not found." });
    }

    if (totalQuantity !== undefined) sensor.totalQuantity = totalQuantity;
    if (availableQuantity !== undefined) sensor.availableQuantity = availableQuantity;
    
    if (conditionSummary !== undefined) {
      sensor.conditionSummary = conditionSummary;
      sensor.unitConditionLog.push({
        condition: conditionSummary,
        notes: notes || "Updated via admin control",
        updatedAt: new Date()
      });
    }

    await sensor.save();
    res.json({ success: true, message: "Sensor inventory updated successfully.", sensor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. REQUEST & APPROVAL FLOW
exports.submitRequest = async (req, res) => {
  try {
    const { 
      sensorId, 
      studentName, 
      studentEmail, 
      enrollmentNo, 
      branch, 
      phone, 
      duration, 
      purpose, 
      projectName, 
      requestedFrom, 
      requestedTo 
    } = req.body;

    if (!sensorId || !studentName || !enrollmentNo || !branch || !phone || !purpose) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required request fields: Student Name, Enrollment No, Branch, Phone Number, and Purpose are required." 
      });
    }

    const sensor = await Sensor.findById(sensorId);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Sensor not found in catalog." });
    }

    if (sensor.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: "This sensor is currently out of stock (Available: 0)." });
    }

    const email = studentEmail || (req.user && req.user.email) || "student@ips.edu";
    const fromDate = requestedFrom ? new Date(requestedFrom) : new Date();
    let toDate = requestedTo ? new Date(requestedTo) : null;
    
    if (!toDate) {
      const days = parseInt(duration) || 7;
      toDate = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const newRequest = new SensorRequest({
      studentId: req.user ? req.user.id : undefined,
      studentName,
      studentEmail: email,
      enrollmentNo,
      branch,
      phone,
      duration: duration || "7 Days",
      purpose,
      projectName: projectName || "Academic Lab Work",
      sensorId,
      sensorName: sensor.name,
      requestedFrom: fromDate,
      requestedTo: toDate,
      status: "pending"
    });

    await newRequest.save();
    res.status(201).json({ 
      success: true, 
      message: "Sensor rental request submitted successfully! Pending faculty review.", 
      request: newRequest 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentRequests = async (req, res) => {
  try {
    const { studentId } = req.params;
    let query = {};
    if (studentId.includes("@")) {
      query = { studentEmail: studentId };
    } else {
      query = { $or: [{ studentId }, { studentEmail: studentId }, { enrollmentNo: studentId }] };
    }

    const requests = await SensorRequest.find(query)
      .populate("sensorId")
      .populate("approvedBy", "email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await SensorRequest.find({ status: "pending" })
      .populate("sensorId")
      .populate("studentId", "email")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await SensorRequest.find()
      .populate("sensorId")
      .populate("studentId", "email")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSensorIssuedStudents = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const requests = await SensorRequest.find({
      sensorId,
      status: { $in: ["approved", "issued", "returned", "pending"] }
    }).sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, approvalNote } = req.body; // decision: 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Invalid decision state." });
    }

    const request = await SensorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const sensor = await Sensor.findById(request.sensorId);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Sensor item not found in catalog." });
    }

    if (decision === "approved") {
      if (request.status === "pending" || request.status === "rejected") {
        if (sensor.availableQuantity <= 0) {
          return res.status(400).json({ success: false, message: "Cannot approve: sensor available quantity is 0." });
        }
        sensor.availableQuantity -= 1;
        await sensor.save();
      }
      request.issuedAt = new Date();
      if (!request.dueAt) {
        const days = parseInt(request.duration) || 7;
        request.dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    } else if (decision === "rejected") {
      // If was previously approved or issued and is now rejected, restore quantity
      if (request.status === "approved" || request.status === "issued") {
        sensor.availableQuantity += 1;
        await sensor.save();
      }
    }

    request.status = decision;
    request.approvedBy = req.user ? req.user.id : undefined;
    request.approverName = (req.user && (req.user.name || req.user.email)) || "Faculty Reviewer";
    request.approvalNote = approvalNote || "";
    request.approvedAt = new Date();

    await request.save();

    // Send in-app notification to the student
    if (decision === "approved") {
      await sendStudentNotification({
        studentId: request.studentId,
        studentEmail: request.studentEmail,
        title: "🔬 Sensor Loan Approved!",
        message: `Your request for ${sensor.name} was approved! Collect it from IoT Lab (Room 302).`
      });
    } else {
      await sendStudentNotification({
        studentId: request.studentId,
        studentEmail: request.studentEmail,
        title: "❌ Sensor Request Update",
        message: `Your loan request for ${sensor.name} was rejected.${approvalNote ? ` Reason: ${approvalNote}` : ""}`
      });
    }

    res.json({ 
      success: true, 
      message: `Request successfully ${decision}. Sensor available stock is now ${sensor.availableQuantity}.`, 
      request, 
      sensor 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. ISSUE & RETURN FLOWS
exports.issueRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SensorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const sensor = await Sensor.findById(request.sensorId);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Related sensor not found." });
    }

    if (request.status === "pending") {
      if (sensor.availableQuantity <= 0) {
        return res.status(400).json({ success: false, message: "No available inventory to issue this sensor." });
      }
      sensor.availableQuantity -= 1;
      await sensor.save();
    }

    request.status = "issued";
    request.issuedAt = new Date();
    if (!request.dueAt) {
      const days = parseInt(request.duration) || 7;
      request.dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    await request.save();

    // Send in-app notification to student
    const dueDateStr = request.dueAt ? new Date(request.dueAt).toLocaleDateString() : "the scheduled due date";
    await sendStudentNotification({
      studentId: request.studentId,
      studentEmail: request.studentEmail,
      title: "📦 Sensor Hardware Issued",
      message: `Your loan for ${sensor.name} is now active. Please ensure it is safely returned by ${dueDateStr}.`
    });

    res.json({ success: true, message: "Sensor marked as Issued.", request, sensor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.returnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, notes } = req.body; // condition: 'ok' or 'damaged'

    const request = await SensorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (request.status === "returned") {
      return res.status(400).json({ success: false, message: "Sensor is already returned." });
    }

    const sensor = await Sensor.findById(request.sensorId);
    if (sensor) {
      // Increment available inventory
      sensor.availableQuantity = Math.min(sensor.totalQuantity, sensor.availableQuantity + 1);
      if (condition === "damaged") {
        sensor.unitConditionLog.push({
          condition: "damaged",
          notes: notes || "Damaged during student loan",
          updatedAt: new Date()
        });
      }
      await sensor.save();
    }

    const returnTime = new Date();
    request.status = "returned";
    request.returnedAt = returnTime;
    request.returnCondition = condition || "ok";
    await request.save();

    let fineCreated = null;

    // Check if late (returned late triggers fine calc)
    if (request.dueAt && returnTime > request.dueAt) {
      const lateMs = returnTime.getTime() - request.dueAt.getTime();
      const lateHours = Math.ceil(lateMs / (1000 * 60 * 60)); // round up hours
      
      if (lateHours > 0) {
        const config = await FineConfig.findOne() || { ratePerHour: 10 };
        const fineAmount = lateHours * config.ratePerHour;

        const fine = new Fine({
          studentId: request.studentId,
          sensorRequestId: request._id,
          lateDuration: lateHours,
          ratePerUnit: config.ratePerHour,
          amount: fineAmount,
          status: "pending"
        });

        await fine.save();
        fineCreated = fine;
      }
    }

    // Auto-create DamageLossCase if returned damaged
    let damageCaseCreated = null;
    if (condition === "damaged") {
      const dmgCase = new DamageLossCase({
        sensorRequestId: request._id,
        studentId: request.studentId,
        sensorId: request.sensorId,
        type: "damaged",
        penaltyAmount: 0, // initially 0, to be updated by admin/faculty
        status: "open",
        notes: notes || "Returned damaged"
      });
      await dmgCase.save();
      damageCaseCreated = dmgCase;
    }

    // Send in-app notification to student
    await sendStudentNotification({
      studentId: request.studentId,
      studentEmail: request.studentEmail,
      title: "✅ Sensor Return Verified",
      message: `${sensor ? sensor.name : "Hardware"} has been safely returned and restocked in the IoT Lab inventory. Thank you!`
    });

    res.json({ 
      success: true, 
      message: "Sensor marked as Returned. Availability incremented.", 
      request,
      fineCreated,
      damageCaseCreated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markLostRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { penaltyAmount, notes } = req.body;

    const request = await SensorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (!["issued", "overdue"].includes(request.status)) {
      return res.status(400).json({ success: false, message: "Only issued or overdue requests can be marked as Lost." });
    }

    // Set request status to lost (terminal)
    request.status = "lost";
    await request.save();

    // Create DamageLossCase with type lost
    const lossCase = new DamageLossCase({
      sensorRequestId: request._id,
      studentId: request.studentId,
      sensorId: request.sensorId,
      type: "lost",
      penaltyAmount: Number(penaltyAmount) || 0,
      status: "open",
      notes: notes || "Marked lost by faculty/admin"
    });

    await lossCase.save();

    res.json({ 
      success: true, 
      message: "Sensor marked as Lost. DamageLossCase created. Inventory unchanged, no fine generated.", 
      request, 
      lossCase 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. FINE MANAGEMENT
exports.getStudentFines = async (req, res) => {
  try {
    const { studentId } = req.params;
    let resolvedStudentId = studentId;
    if (studentId.includes("@")) {
      const user = await User.findOne({ email: studentId });
      if (user) resolvedStudentId = user._id;
    }

    const fines = await Fine.find({ studentId: resolvedStudentId })
      .populate("sensorRequestId")
      .sort({ createdAt: -1 });

    res.json({ success: true, fines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markFinePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const fine = await Fine.findById(id);
    if (!fine) {
      return res.status(404).json({ success: false, message: "Fine record not found." });
    }

    fine.status = "paid";
    fine.markedPaidBy = req.user.id;
    fine.markedPaidAt = new Date();

    await fine.save();
    res.json({ success: true, message: "Fine marked as Paid offline.", fine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. DAMAGE/LOSS CASE LOGS
exports.logDamageLossCase = async (req, res) => {
  try {
    const { sensorRequestId, studentId, sensorId, type, penaltyAmount, notes } = req.body;
    if (!sensorRequestId || !studentId || !sensorId || !type || penaltyAmount === undefined) {
      return res.status(400).json({ success: false, message: "Missing damage loss case details." });
    }

    const dmgCase = new DamageLossCase({
      sensorRequestId,
      studentId,
      sensorId,
      type,
      penaltyAmount,
      status: "open",
      notes: notes || ""
    });

    await dmgCase.save();
    res.status(201).json({ success: true, message: "Damage/Loss case logged successfully.", dmgCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveDamageLossCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { penaltyAmount, notes } = req.body;

    const dmgCase = await DamageLossCase.findById(id);
    if (!dmgCase) {
      return res.status(404).json({ success: false, message: "Damage/Loss case not found." });
    }

    if (penaltyAmount !== undefined) dmgCase.penaltyAmount = penaltyAmount;
    if (notes !== undefined) dmgCase.notes = notes;

    dmgCase.status = "resolved";
    dmgCase.resolvedAt = new Date();

    await dmgCase.save();
    res.json({ success: true, message: "Damage/Loss case marked as Resolved.", dmgCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. FINE CONFIGURATION
exports.getFineConfig = async (req, res) => {
  try {
    let config = await FineConfig.findOne();
    if (!config) {
      config = new FineConfig({ ratePerHour: 10 });
      await config.save();
    }
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFineConfig = async (req, res) => {
  try {
    const { ratePerHour } = req.body;
    if (ratePerHour === undefined || ratePerHour < 0) {
      return res.status(400).json({ success: false, message: "Invalid ratePerHour value." });
    }

    let config = await FineConfig.findOne();
    if (!config) {
      config = new FineConfig({ ratePerHour });
    } else {
      config.ratePerHour = ratePerHour;
    }

    await config.save();
    res.json({ success: true, message: "Fine Config updated successfully.", config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. ADMIN DASHBOARD
exports.getAdminDashboard = async (req, res) => {
  try {
    // A. Overdue List
    const overdueList = await SensorRequest.find({ status: "overdue" })
      .populate("sensorId")
      .populate("studentId", "email");

    // B. Total Pending Fines
    const pendingFines = await Fine.find({ status: "pending" });
    const totalPendingFines = pendingFines.reduce((sum, f) => sum + f.amount, 0);

    // C. Open Damage/Loss Cases
    const openDamageCases = await DamageLossCase.find({ status: "open" })
      .populate("sensorId")
      .populate("studentId", "email")
      .populate("sensorRequestId");

    // D. Usage Stats (aggregation of most-requested sensors)
    const usageStats = await SensorRequest.aggregate([
      { $group: { _id: "$sensorId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Populate usage stats manually
    const populatedStats = [];
    for (const stat of usageStats) {
      const sensor = await Sensor.findById(stat._id);
      if (sensor) {
        populatedStats.push({
          sensorName: sensor.name,
          type: sensor.type,
          department: sensor.department,
          requestCount: stat.count
        });
      }
    }

    res.json({
      success: true,
      overdueList,
      totalPendingFines,
      openDamageCases,
      populatedStats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
