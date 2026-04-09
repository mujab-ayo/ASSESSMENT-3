const authRoute = require("express").Router();
const passport = require("passport");
const userSchema = require("../models/user");

authRoute.get("/login", (req, res) => {
  res.render("login", { error: null });
});

authRoute.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

authRoute.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/task");
  },
);



authRoute.post("/signup", (req, res) => {
  const user = req.body;
  userSchema.register(
    { username: user.username },
    user.password,
    (err, user) => {
      if (err) {
        console.log("REGISTER ERROR:", err.message);
        return res.status(400).send(err.message);
      }

      req.login(user, (err) => {
        if (err) {
          console.log("LOGIN AFTER SIGNUP ERROR:", err);
          return res.status(500).send("Login failed after signup");
        }
        return res.redirect("/task");
      });
    }
  );
});

authRoute.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

module.exports = authRoute;
