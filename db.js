const mongoose = require("mongoose");
require("dotenv").config();

 async function connectToDB() {
   await mongoose.connect(process.env.MONGODB_URL);

  mongoose.connection.on("connected", () => {
    console.log("DB connected successfully");
  });

  mongoose.connection.on("error", () => {
    console.log("connection Failed");
  });
}

module.exports = connectToDB;
