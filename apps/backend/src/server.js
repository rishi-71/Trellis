require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const activityRoutes = require("./routes/activityRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Trellis backend is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Trellis backend running on port ${PORT}`);
});