require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";
const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.log("Usage: node promote.js <email>");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const user = await User.findOne({ email: emailToPromote.toLowerCase().trim() });
    if (!user) {
      console.log(`User with email "${emailToPromote}" not found.`);
      process.exit(1);
    }
    user.role = "admin";
    await user.save();
    console.log(`User "${emailToPromote}" successfully promoted to "admin"!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
