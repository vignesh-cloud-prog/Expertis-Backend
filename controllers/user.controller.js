const bcrypt = require("bcryptjs");
const userServices = require("../services/user.services");
const { uploadUserPic } = require("../middleware/upload.js");

const crypto = require("crypto");
const key = "verysecretkey";

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
  const { password } = req.body;
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
  console.log("hjbhj");
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

exports.forgetPassword = (req, res, next) => {
  const email = req.body.email;
  userServices.forgetPassword(email, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.verifyOTP = (req, res, next) => {
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

exports.changePassword = (req, res, next) => {
  console.log("changePassword");
  const email = req.body.email;
  const otp = req.body.otp;
  const hash = req.body.hash;
  const { password } = req.body;

  // Separate Hash value and expires from the hash returned from the user

  let [hashValue, expires] = hash.split(".");
  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) {
    return res.status(400).send({
      message: "OTP Expired",
    });
  }
  // Calculate new hash with the same key and the same algorithm
  let data = `${email}.${otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes

  if (newCalculatedHash === hashValue) {
    console.log("matched");

    const salt = bcrypt.genSaltSync(10);

    req.body.password = bcrypt.hashSync(password, salt);

    userServices.changePassword(req.body, (error, results) => {
      if (error) {
        console.log(error);
        return next(error);
      }
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    });
  } else {
    return res.status(400).send({
      message: "OTP does not match",
    });
  }
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
