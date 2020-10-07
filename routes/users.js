const bodyParser = require("body-parser");
var express = require("express");
var userRouter = express.Router();
const User = require("../models/users");
// router.use(bodyParser.json());
const authenticate = require("../authenticate");
const passport = require("passport");
const cors = require("./cors");

/*Register a user. */
userRouter.route("/signup").post(cors.corsWithOptions, (req, res, next) => {
  console.log("body" + JSON.stringify(req.body));
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration successful" });
          });
        });
      }
    }
  );
});

userRouter.post("/login", cors.corsWithOptions, passport.authenticate("local"), (req, res) => {
  const jwtToken = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: true, token: jwtToken, status: "Login successful" });
});

userRouter.route("/").get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
    .then((users) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(users);
    })
    .catch((err) => next(err));
});


  

  

module.exports = userRouter;
