const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const favouriteRouter = express.Router();
const authenticate = require("../authenticate");
const Favourites = require("../models/favourites");

favouriteRouter.route("/").options(cors.corsWithOptions, (req, res) => {
  res.statusCode = 200;
});
get(cors.cors, authenticate.verifyUser, (req, res, next) => {
  Favourites.find({})
    .then(
      (favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/");
        res.json(favorites);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
})
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.deleteMany({})
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favouriteRouter
  .route("/:favouriteId")
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.findById(req.params.favouriteId)
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favourites.findByIdAndDelete(req.params.favouriteId)
        .then(
          (favourite) => {
            res.status(200).json(favourite);
          },
          (err, res) => {
            next(err);
          }
        )
        .catch((err) => next(err));
    }
  );
module.exports = favouriteRouter;