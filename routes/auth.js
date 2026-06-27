const authRoute = require("express").Router();
const jwt = require("jsonwebtoken");
const userSchema = require("../models/user");

/**
 * Sign a JWT and set it as a cookie.
 * This IS the auth token — no session involved.
 */
function issueJWT(res, user) {
  const token = jwt.sign(
    { userId: String(user._id), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  // httpOnly: false so browser JS can read it for WebSocket auth
  res.cookie("token", token, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

authRoute.get("/login", (req, res) => {
  res.render("login", { error: null });
});

authRoute.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

authRoute.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userSchema.findOne({ username });
    if (!user) {
      return res.render("login", { error: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid username or password" });
    }

    issueJWT(res, user);
    res.redirect("/task");
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.render("login", { error: "Something went wrong. Please try again." });
  }
});

authRoute.post("/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existing = await userSchema.findOne({ username });
    if (existing) {
      return res.render("signup", { error: "Username already taken" });
    }

    const user = await userSchema.create({
      username,
      password,
      email: email || "",
    });

    issueJWT(res, user);
    res.redirect("/task");
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.render("signup", { error: "Something went wrong. Please try again." });
  }
});

authRoute.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = authRoute;
