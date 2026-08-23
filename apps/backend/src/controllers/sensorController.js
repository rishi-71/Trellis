const Sensor = require("../models/Sensor");
const SensorRequest = require("../models/SensorRequest");
const Fine = require("../models/Fine");
const DamageLossCase = require("../models/DamageLossCase");
const FineConfig = require("../models/FineConfig");
const User = require("../models/User");

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
    const { sensorId, purpose, projectName, requestedFrom, requestedTo } = req.body;
    if (!sensorId || !purpose || !projectName || !requestedFrom || !requestedTo) {
      return res.status(400).json({ success: false, message: "Missing request parameters." });
    }

    const sensor = await Sensor.findById(sensorId);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Sensor not found in catalog." });
    }

    const newRequest = new SensorRequest({
      studentId: req.user.id,
      sensorId,
      purpose,
      projectName,
      requestedFrom: new Date(requestedFrom),
      requestedTo: new Date(requestedTo),
      status: "pending"
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Sensor request submitted and pending manual faculty review.", request: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentRequests = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Resolve email if studentId is email
    let resolvedStudentId = studentId;
    if (studentId.includes("@")) {
      const user = await User.findOne({ email: studentId });
      if (user) resolvedStudentId = user._id;
    }

    const requests = await SensorRequest.find({ studentId: resolvedStudentId })
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
      .populate("studentId", "email");
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

    request.status = decision;
    request.approvedBy = req.user.id;
    request.approvalNote = approvalNote || "";
    request.approvedAt = new Date();

    await request.save();
    res.json({ success: true, message: `Request successfully ${decision}.`, request });
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

    if (request.status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved sensor requests can be marked as Issued." });
    }

    const sensor = await Sensor.findById(request.sensorId);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Related sensor not found." });
    }

    if (sensor.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: "No available inventory to issue this sensor." });
    }

    // Decrement inventory
    sensor.availableQuantity -= 1;
    await sensor.save();

    // Mark as issued
    const durationMs = request.requestedTo.getTime() - request.requestedFrom.getTime();
    request.status = "issued";
    request.issuedAt = new Date();
    request.dueAt = new Date(Date.now() + durationMs);

    await request.save();
    res.json({ success: true, message: "Sensor marked as Issued. Availability decremented.", request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.returnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, notes } = req.body; // condition: 'ok' or 'damaged'

    if (!["ok", "damaged"].includes(condition)) {
      return res.status(400).json({ success: false, message: "Invalid return condition." });
    }

    const request = await SensorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (!["issued", "overdue"].includes(request.status)) {
      return res.status(400).json({ success: false, message: "Only issued or overdue sensors can be marked as Returned." });
    }

    const sensor = await Sensor.findById(request.sensorId);
    if (!sensor) {
      return res.status(404).json({ success: false, message: "Related sensor not found." });
    }

    // Always increment availableQuantity when item physically returns (ok or damaged)
    sensor.availableQuantity += 1;
    await sensor.save();

    const returnedAt = new Date();
    const originalStatus = request.status;

    request.status = "returned";
    request.returnedAt = returnedAt;
    request.returnCondition = condition;
    await request.save();

    let fineCreated = null;

    // Check if late (returned late triggers fine calc)
    if (returnedAt > request.dueAt) {
      const lateMs = returnedAt.getTime() - request.dueAt.getTime();
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
