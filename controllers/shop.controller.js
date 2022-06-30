const shopServices = require("../services/shop.services");
const bcrypt = require("bcryptjs");
const { uploadShopLogo } = require("../middlewares/upload.js");

exports.register = (req, res, next) => {
  const { password, email, phone } = req.body;
  if (email === undefined) {
    return callback(
      {
        message: "Email Required",
      },

    );
  }
  if (phone === undefined) {
    return callback({
      message: "Phone Required",
    });
  }

  const salt = bcrypt.genSaltSync(10);

  req.body.password = bcrypt.hashSync(password, salt);

  shopServices.register(req.body, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.addService = (req, res, next) => {
  console.log("hello")
  shopServices.addservice(req.body, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
exports.updateService = (req, res, next) => {
  shopServices.updateservice(req.body, (error, results) => {
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

  shopServices.login({ email, password }, (error, results) => {


    if (error) {

      if (error.code == 302) {
        return res.status(302).send({
          message: "verify your account",
          data: error,
        });
      }
      console.log(error)
      return next(error);

    }

    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.verify_otp = (req, res, next) => {

  const email = req.body.email;
  const otp = req.body.otp;
  const hash = req.body.hash
  shopServices.verifyOTP(email, otp, hash, (error, results) => {
    if (error) {
      console.log(error)
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getShop = (req, res, next) => {
  var model = {
    shopId: req.params.id,
  };

  shopServices.getShopById(model, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.updateShop = (req, res, next) => {
  uploadShopLogo(req, res, function (err) {
    if (err) {
      next("ERR", err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        shopId: req.params.id,
        shopName: req.body.shopName,
        phone: req.body.productName,
        address: req.body.productDescription,
        pincode: req.body.productPrice,
        shoplogo: path != "" ? url + "/" + path : "",
      };


      console.log(model);

      shopServices.updateShop(model, (error, results) => {
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

exports.deleteShop = (req, res, next) => {
  var model = {
    shopId: req.params.id,
  };

  shopServices.deleteShop(model, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

