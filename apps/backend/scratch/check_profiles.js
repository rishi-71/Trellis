require("dotenv").config();
const mongoose = require("mongoose");
const StudentProfile = require("../src/models/StudentProfile");
const User = require("../src/models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const profiles = await StudentProfile.find().populate("user", "email");
    console.log(`Found ${profiles.length} student profiles in database:`);
    for (const p of profiles) {
      console.log(`- Profile ID: ${p._id} | User Email: ${p.user?.email} | Name: ${p.name} | Roll Number: ${p.rollNumber}`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
