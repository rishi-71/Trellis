const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://127.0.0.1:27017/trellis";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const profiles = await db.collection("studentprofiles").find({}).toArray();
    console.log("PROFILES IN DB:");
    console.log(JSON.stringify(profiles, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
