const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/user");

const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies["secret_token"];
        }
        return token;
      },
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);


passport.use(
    "signup",
    new localStrategy(
        {
            usernameField: "username",
            passwordField: "password"
        },
        async (username, password, done) => {
            try {
            const user = await User.create({ username, password });
            return done(null, user);
        } catch (error) {
            done(error);
        }
    }
    )
)



passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
          const user = await User.findOne({ username })
          
          if (!user) {
              return done(null, false, { message: "User not found" });
          }

          const isUserValid = await user.isValidPassword(password);

          if (!isUserValid) {
              return done(null, false, { message: "Wrong password" });
          }


          return done(null, user, { message: "Logged in successfully" });
          
          
      } catch (error) {
        done(error);
      }
    },
  ),
);
