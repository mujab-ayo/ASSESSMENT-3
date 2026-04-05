require("dotenv").config();

const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const taskRoute = require("./routes/task");
const authRoute = require("./routes/auth");

require("./config/db").connectToDB();

require("./authentication/auth");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.use(cookieParser()); 
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", authRoute);
app.use("/task", passport.authenticate("jwt", { session: false }), taskRoute);

app.use((err, req, res, next) => {
  console.log(err);

  res.status(err.status || 500);

  res.json({ err: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
