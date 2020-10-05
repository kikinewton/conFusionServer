const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");
const dishRouter = express.Router();
const authenticate = require("../authenticate");

const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);
connect.then(
  (db) => {
    console.log("Connected to server successfully");
  },
  (err) => {
    console.error(err);
  }
);

dishRouter
  .route("/")
  .get((req, res, next) => {
    Dishes.find({})
      .populate("comments.author")
      .then(
        (dishes) => {
          // console.log("All dishes: " + dishes.toString());
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish created: " + dish);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Put operation not allowed");
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.remove({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

//endpoint with uri for dishes
dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          console.log(`Dish with id ${req.params.dishId} : ${dish}`);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Post operation is not allowed");
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndDelete(req.params.dishId)
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

/**
 * endpoint to handle the comments for dish
 * dishes/:dishId/comments
 */

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error(
              `Dish with dishId: ${req.params.dishId} does not exist`
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(
              `Dish with dishId ${req.params.dishId} does not exist`
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Put operation not allowed");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            dish.comments.forEach((element) => {
              element.remove();
            });
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish Not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get( authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          // console.log(dish.comments.author)
          console.log('test comment: ' + dish.comments.id(req.params.commentId).author.equals(req.user))
          console.log('test author: ' + dish.comments.id(req.params.commentId).author)
         
          console.log('test body of user: ' + req.user)
          if (dish != null && dish.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error(`Dish with dishId: ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(
              `Comment with commentId: ${req.params.commentId} not found`
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    console.log('test body of user: ' + req.user)
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          // console.log('test comment: ' + dish.comments.id(req.params.commentId).author.equals(req.user))
          // console.log('test author: ' + dish.comments.id(req.params.commentId).author)
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.forEach((element) => {
              if (element._id == req.params.commentId) {
                element.remove();
              }
            });
            dish
              .save()
              .populate("comments.author")
              .then(
                () => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish);
                },
                (err) => next(err)
              );
          } else if (dish == null) {
            err = new Error(`Dish with dishId: ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(
              `Comment with commentId: ${req.params.commentId} not found`
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Post operation not allowed");
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          console.log('test comment: ' + dish.comments.id(req.params.commentId).author.equals(req.user))
          console.log('test author: ' + dish.comments.id(req.params.commentId).author)
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then((dish) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            });
          } else if (dish == null) {
            err = new Error(`Dish with dishId: ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(
              `Comment with commentId: ${req.params.commentId} not found`
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;
