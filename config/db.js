const mongoose = require("mongoose");
require("dotenv").config();

function connectToDB() {
  mongoose.connect(process.env.MONGODB_URL);

  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Error connecting to MongoDB", err);
  });
}

module.exports = { connectToDB };
