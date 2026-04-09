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
        res.status(400).send(err.message);
      } else {
         req.login(user, (err) => {
          if (err) {
            res.status(400).send(err.message);
             } 
             res.redirect("/task");
             
        });
      }
    },
  );
});



module.exports = authRoute;
