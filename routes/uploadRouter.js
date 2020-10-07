const bodyParser = require("body-parser");
const express = require("express");
const uploadRouter = express.Router();
const authenticate = require("../authenticate");
const multer = require("multer");
const cors = require("./cors");

uploadRouter.use(bodyParser.json());
uploadRouter.route("/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    cb(new Error("File format is not supported"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

uploadRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {res.statusCode = 200})
  .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("GET operation not allowed");
  })
  .put(cors.corsWithOptions, cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not allowed");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end("DELETE operation not allowed");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'),(req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file)
  })

module.exports = uploadRouter;
