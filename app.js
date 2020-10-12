var createError = require("http-errors");
const bodyParser = require("body-parser");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const config = require("./config");
const mongoUrl = config.mongoUrl;
const passport = require("passport");
var indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const dishRouter = require("./routes/dishRouter");
const leaderRouter = require("./routes/leaderRouter");
const promoRouter = require("./routes/promoRouter");
const uploadRouter = require("./routes/uploadRouter");
const favouriteRouter = require("./routes/favouriteRouter");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

//secure traffic only
app.all('*', (req, res, next) => {
  if(req.secure){
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
})

app.use("/", indexRouter);
// console.log("before /users");
app.use("/users", usersRouter);
app.use("/dishes", dishRouter);
app.use("/promos", promoRouter);
app.use("/leaders", leaderRouter);
app.use('/uploadImage', uploadRouter);
app.use('/favourites', favouriteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
