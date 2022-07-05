const shopServices = require("../services/shop.services");
const bcrypt = require("bcryptjs");
const { uploadShopLogo, uploadServicePhoto } = require("../middleware/upload.js");

exports.create = (req, res, next) => {

  uploadShopLogo(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        owner: req.body.owner_id,
        shopName: req.body.shopName,
        phone: req.body.phone,
        address: req.body.address,
        pincode: req.body.pincode,
        shopLogo: path != "" ? url + "/" + path : "",
      };

      if (model.shopLogo == "") {
        delete model.shopLogo;
      }

      // console.log(model);

      shopServices.create(model, (error, results) => {
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

exports.addService = (req, res, next) => {

  uploadServicePhoto(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        id: req.body.shop_id,
        service_data: {
          serviceName: req.body.serviceName,
          price: req.body.price,
          time: req.body.time,
          discription: req.body.discription,
          photo: path != "" ? url + "/" + path : "",
        }
      }

      if (model.service_data.photo == "") {
        delete model.service_data.photo;
      }

      console.log(model);

      shopServices.addservice(model, (error, results) => {
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
exports.updateService = (req, res, next) => {
  uploadServicePhoto(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        id: req.body.service_id,
        service_data: {
          serviceName: req.body.serviceName,
          price: req.body.price,
          time: req.body.time,
          discription: req.body.discription,
          photo: path != "" ? url + "/" + path : "",
        }
      }

      if (model.service_data.photo == "") {
        delete model.service_data.photo;
      }

      console.log(model);

      shopServices.updateservice(model, (error, results) => {
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
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        shopId: req.params.id,
        shopName: req.body.shopName,
        phone: req.body.phone,
        address: req.body.address,
        pincode: req.body.pincode,
        shoplogo: path != "" ? url + "/" + path : "",
      };

      if (model.shoplogo == "") {
        delete model.shoplogo;
      }

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

