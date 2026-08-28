require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    console.log("USERS IN DB:");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
