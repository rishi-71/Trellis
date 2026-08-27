require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});
global.io = io;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  
  socket.on("join:user", (userId) => {
    socket.join(userId);
    console.log(`Socket joined user room: ${userId}`);
  });

  socket.on("join:conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket joined conversation: ${conversationId}`);
  });

  socket.on("leave:conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`Socket left conversation: ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const path = require("path");
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const activityRoutes = require("./routes/activityRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const campusRoutes = require("./routes/campusRoutes");
const placementRoutes = require("./routes/placementRoutes");

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount routes
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", campusRoutes);
app.use("/api/placement", placementRoutes);

// Mount M7 Sensor Issuing System routes
const sensorRoutes = require("./routes/sensorRoutes");
app.use("/api/sensors-module", sensorRoutes);

// Automatic Background PDF Generation for Passed Deadlines
const JobPosting = require("./models/JobPosting");
const AdminReport = require("./models/AdminReport");
const placementController = require("./controllers/placementController");

setInterval(async () => {
  try {
    const passedJobs = await JobPosting.find({
      applicationDeadline: { $lte: new Date() }
    });

    for (const job of passedJobs) {
      const reportExists = await AdminReport.findOne({ jobPostingId: job._id });
      if (!reportExists) {
        console.log(`Auto-generating post-deadline PDF report for company: ${job.companyName}`);
        const mockReq = { params: { id: job._id.toString() } };
        const mockRes = {
          status: () => mockRes,
          json: (data) => console.log(`Auto-report status details: ${JSON.stringify(data)}`)
        };
        await placementController.generatePostDeadlineReport(mockReq, mockRes);
      }
    }
  } catch (err) {
    console.error("Auto deadline checker routine failed:", err);
  }
}, 60000);

// M7 Overdue Sensor Request Checker Loop (runs every 60 seconds)
const SensorRequest = require("./models/SensorRequest");
setInterval(async () => {
  try {
    const overdueRequests = await SensorRequest.find({
      status: "issued",
      dueAt: { $lt: new Date() }
    });
    for (const reqObj of overdueRequests) {
      reqObj.status = "overdue";
      await reqObj.save();
      console.log(`[M7] Auto-marked SensorRequest ${reqObj._id} as overdue (dueAt was ${reqObj.dueAt})`);
    }
  } catch (err) {
    console.error("M7 background overdue checker routine failed:", err);
  }
}, 60000);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Trellis backend is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Trellis backend running on port ${PORT}`);
});