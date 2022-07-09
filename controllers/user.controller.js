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
exports.updateUser = (req, res, next) => {
  //console.log("updateUser");
  uploadUserPic(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const { id, name, phone, dob, gender, role, address, pinCode } = req.body;

      //console.log("Inside update user")
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";
      let picURL = path != "" ? url + "/" + path : "";

      let model = {
        id: req.body.id,
      };

      if (picURL != "" && picURL !== undefined) {
        model.userPic = picURL;
      }
      if (name != "" && name !== undefined && name !== null) {
        model.name = name;
      }
      if (phone != "" && phone !== undefined && phone !== null) {
        model.phone = phone;
      }
      if (dob != "" && dob !== undefined && dob !== null) {
        model.dob = dob;
      }
      if (gender != "" && gender !== undefined && gender !== null) {
        model.gender = gender;
      }
      if (role != "" && role !== undefined && role !== null) {
        model.role = role;
      }
      if (address != "" && address !== undefined && address !== null) {
        model.address = address;
      }
      if (pinCode != "" && pinCode !== undefined && pinCode !== null) {
        model.pinCode = pinCode;
      }

      //console.log("model: ", model);

      userServices.updateUser(model, (error, results) => {
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
  const { token } = req.params;
  // //console.log("token ", token);
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

exports.verifyToken = (req, res, next) => {
  return res.status(200).json({ message: "Authorized User!!" });
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
  const id = req.body.id;
  const otp = req.body.otp;
  const hash = req.body.hash;

  if (!id && !otp && !hash) {
    return res.status(400).send({
      message: "Data is missing",
    });
  }
  userServices.verifyOTP(id, otp, hash, (error, results) => {
    if (error) {
      // //console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.changePassword = (req, res, next) => {
  // //console.log("changePassword");
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
    // //console.log("matched");

    const salt = bcrypt.genSaltSync(10);

    req.body.password = bcrypt.hashSync(password, salt);

    userServices.changePassword(req.body, (error, results) => {
      if (error) {
        // //console.log(error);
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
      // //console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.deleteUser = (req, res, next) => {
  
  userServices.deleteUser(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
