require("dotenv").config();

const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");


const authRoute = express.Router();

authRoute.get("/", (req, res) => {
  res.redirect("/signup");
});

authRoute.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

authRoute.get("/login", (req, res) => {
  res.render("login", { error: null });
});


authRoute.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (req, res, next) => {
     res.redirect("/login");
  },
);

authRoute.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = new Error("user or password is incorrect");
        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { id: user._id, username: user.username };

        const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

        res.cookie("secret_token", token, { httpOnly: true });
        return res.redirect("/task");
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = authRoute;
