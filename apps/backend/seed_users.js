
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";

const defaultUsers = [
  { email: "admin@ips.edu", password: "admin123", role: "admin" },
  { email: "faculty@ips.edu", password: "faculty123", role: "faculty" },
  { email: "student@ips.edu", password: "student123", role: "student" }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB for seeding default users...");

    for (const u of defaultUsers) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        // Update password and role to ensure they match
        exists.password = u.password;
        exists.role = u.role;
        await exists.save();
        console.log(`Updated existing user: Email: ${u.email} | Password: ${u.password} | Role: ${u.role}`);
      } else {
        const newUser = new User(u);
        await newUser.save();
        console.log(`Created new user: Email: ${u.email} | Password: ${u.password} | Role: ${u.role}`);
      }
    }

    console.log("Seeding completed successfully! You can now log in using these accounts.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database connection/seeding failed:", err);
    process.exit(1);
  });
