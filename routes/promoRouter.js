const bodyParser = require("body-parser");
const express = require("express");
const Promos = require("../models/promotions");
const authenticate = require('../authenticate');
const promoRouter = express.Router();
const cors = require('./cors');

promoRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {res.statusCode = 200})
  .get(cors.cors, (req, res, next) => {
    Promos.find({})
      .then(
        (promos) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promos);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promos.create(req.body)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Put operation not allowed");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promos.deleteMany({})
      .then(
        (promos) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promos);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

  /**
   * endpoint with uri for promo
   */

promoRouter
  .route("/:promoId")
  .options(cors.corsWithOptions, (req, res) => {res.statusCode = 200})
  .get(cors.cors, (req, res, next) => {
    Promos.findById(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Post operation is not allowed");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promos.findByIdAndUpdate(
      req.params.promoId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promos.findOneAndDelete(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = promoRouter;
