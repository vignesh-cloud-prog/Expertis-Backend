const bcrypt = require("bcryptjs");
const userServices = require("../services/user.services");
const { uploadUserPic } = require("../middleware/upload.js");

const { body, validationResult } = require('express-validator');


/**
 * 1. To secure the password, we are using the bcryptjs, It stores the hashed password in the database.
 * 2. In the SignIn API, we are checking whether the assigned and retrieved passwords are the same or not using the bcrypt.compare() method.
 * 3. In the SignIn API, we set the JWT token expiration time. Token will be expired within the defined duration.
 */
exports.updateProfile = (req, res, next) => {
  uploadUserPic(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        id: req.body.id,
        name: req.body.name,
        address: req.body.address,
        dob: req.body.dob,
        gender: req.body.gender,
        userPic: path != "" ? url + "/" + path : "",
      };
      if (model.userPic == "") {
        delete model.userPic;
      }

      console.log(model);

      userServices.updateProfile(model, (error, results) => {
        if (error) {
          return next(error);
        }
        return res.status(200).send({
          message: "Success",
          data: results,
        });
      });
    }
  });
};

exports.register = (req, res, next) => {
  const { password} = req.body;
  

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  const salt = bcrypt.genSaltSync(10);

  req.body.password = bcrypt.hashSync(password, salt);
  const host = req.headers.host;

  userServices.register({ ...req.body, host }, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.login = (req, res, next) => {
  console.log("gnc");
  const { email, password } = req.body;
  const host = req.headers.host;

  userServices.login({ email, password, host }, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.verify = (req, res, next) => {
  console.log("hjbhj")
  const { token } = req.params;
  console.log("token ", token);
  // Check we have an id
  if (!token) {
    return res.status(422).send({
      message: "Missing Token",
    });
  }
  userServices.verify({ token }, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Account Verified",
      data: results,
    });
  });
};

exports.userProfile = (req, res, next) => {
  return res.status(401).json({ message: "Authorized User!!" });
};

exports.send_otp = (req, res, next) => {
  const email = req.body.email;
  userServices.send_otp(email, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.verify_otp = (req, res, next) => {
  console.log("ghvhv")
  const email = req.body.email;
  const otp = req.body.otp;
  const hash = req.body.hash;
  
  if (!email && !otp && !hash) {
    return res.status(500).send({
      message: "Data is missing",

    });
  }
  userServices.verifyOTP(email, otp, hash, (error, results) => {
    if (error) {
      console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.new_password = (req, res, next) => {

  const { password } = req.body;

  const salt = bcrypt.genSaltSync(10);

  req.body.password = bcrypt.hashSync(password, salt);

  userServices.new_password(req.body, (error, results) => {
    if (error) {
      console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.reset_password = (req, res, next) => {
  const { newPassword } = req.body;

  const salt = bcrypt.genSaltSync(10);

  req.body.newPassword = bcrypt.hashSync(newPassword, salt);
  userServices.reset_password(req.body, (error, results) => {
    if (error) {
      console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
