const express = require("express");
const bodyParser = require("body-parser");
const cors = require("./cors");
const favouriteRouter = express.Router();
const authenticate = require("../authenticate");
const Favourites = require("../models/favourites");
const Dishes = require("../models/dishes");

favouriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const input_dishes = req.body;
    const dishes = [];
    input_dishes.forEach((element) => {
      const result = verifyDish(element._id);
      result ? dishes.push(element._id) : res.send("Invalid dish");
    });

    const favourite = new Favourites({
      user: req.user._id,
      dishes: [],
    });

    Favourites.create(favourite)
      .then(
        (favorite) => {
          dishes.forEach((d) => {
            console.log("hey >> " + d);
            if (d !== null) {
              Dishes.findById(d)
                .then(
                  (dish) => favorite.dishes.push(dish),
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else {
              res.send("Invalid");
              return;
            }
          });
          // console.log("----> " + favorite);
          favorite
            .save()
            .then((f) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(f);
            }, (err) => next(err))
            .catch((err) => next(err));
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
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

async function verifyDish(dishId) {
  try {
    const isValid = await Dishes.exists({ _id: dishId }, function (
      err,
      result
    ) {
      if (err) {
        console.error(err);
      } else {
        return result;
      }
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = favouriteRouter;
