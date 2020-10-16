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
    Favourites.find({ user: req.user })
      .populate("user")
      .populate("dishes")
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
      result ? dishes.push(element._id) : console.log("Invalid dish");
    });

    const favourite = createFavorite(req.user._id, dishes).then((newFav) =>
      Favourites.create(newFav)
        .then(
          (f) => {
            console.log("----> " + f);
            res.status(200).json(f);
          },
          (err) => next(err)
        )
        .catch((err) => next(err))
    );
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
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    /**get and verify the dishId from req.param */
    const dishId = req.params.dishId;
    const result = verifyDish(dishId);
    /**check favourites and verify the user doesnt have a this dish as favourite */

    Favourites.findOne({ user: req.user })
      .then((fav) => {
        if (result && fav.dishes.indexOf(dishId) < 0) {
          // console.log("Fav dishes for user about to be added");
          result
            ? fav.dishes.push(dishId)
            : res
                .status(200)
                .json({ message: `Could not add dish with id ${dishId}` });
          fav.save();
          res.status(200).json(fav);
        } else {
          res
            .status(200)
            .json({ message: "User already has this dish as favourite" });
        }
      })
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
      .then(
        (favourite) => {
          console.log("dishes keys ---> " + favourite);
          const result = favourite.dishes.forEach((dish) => {
            if (dish._id === req.params.dishId) {
              favourite.dishes.remove(dish);
            }
          });
          console.log(result);
          favourite.save();
          res.status(200).json(favourite);
        },
        (err, res) => {
          next(err);
        }
      )
      .catch((err) => next(err));
  });

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

async function addFavourite(dishId) {
  try {
    const resultx = await Dishes.findOne({ _id: dishId }, function (
      err,
      result
    ) {
      if (err) {
        console.error(err);
      } else {
        console.log("From addFavorite " + result);
        return result;
      }
    });
    // console.log("From the await dishes " + result);
    // fav.push(result);
  } catch (error) {
    console.error(error);
  }
}

function createFavorite(userId, dishList) {
  return new Promise(function (resolve, reject) {
    if (dishList.length > 0) {
      const favourite = new Favourites({
        user: userId,
        dishes: dishList,
      });
      // favourite.save();
      resolve(favourite);
    } else {
      reject(new Error("Could not create favourite"));
    }
  });
}

module.exports = favouriteRouter;
