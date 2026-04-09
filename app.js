require("dotenv").config();

const express = require("express");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const bodyParser = require("body-parser");

const userSchema = require("./models/user");
const authRoute = require("./routes/auth");
const todoRoute = require("./routes/todo");



const DB = require("./db");


const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(userSchema.createStrategy());
passport.serializeUser(userSchema.serializeUser());
passport.deserializeUser(userSchema.deserializeUser());

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/", authRoute);

app.use("/task", connectEnsureLogin.ensureLoggedIn(), todoRoute);

app.use((err, req, res, next) => {
  console.log(err);

  res.status(err.status || 500);

  res.json({ err: err.message });
});

DB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
