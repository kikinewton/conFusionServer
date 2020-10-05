const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const config = require("./config");
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opt = {};
opt.secretOrKey = config.secretKey;
opt.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

exports.jwtPassport = passport.use(
  new JwtStrategy(opt, (jwt_payload, done) => {
    // console.log("JWT payload:" + jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyAdmin = (req, res, next) => {
  try {
    console.log("is an admin? " + req.user.admin);
    if (req.user.admin === true) {
      console.log(`user is admin`);
      return next();
    } else {
      console.log(`user is not admin`);
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, message: "You are not authorized to perform this operation!" });
    }
  } catch (error) {
    return next(error);
  }
};

exports.verifyLoginUser = (req, res, next) => {
  try {
    console.log("userId :" + req.user._id)
    User.findById(req.user._id)
      .then((user) => {
        console.log(user);
        if (user._id === req.user._id)
        return next();
      })
      .catch((err) => next(err));
  } catch (error) {
    return next(error);
  }
}

exports.verifyUser = passport.authenticate("jwt", { session: false });

