const shopServices = require("../services/shop.services");
const bcrypt = require("bcryptjs");
const {
  uploadShopLogo,
  uploadServicePhoto,
} = require("../middleware/upload.js");
const { getDDMMMYYYYDate } = require("../utils/utils");

exports.createShop = (req, res, next) => {
  uploadShopLogo(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      let contactJson;

      try {
        contactJson = JSON.parse(req.body.contact);
        console.log(contactJson);
      } catch (e) {
        console.log(e);
        return next(e);
      }
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        shopId: req.body.shopId,
        owner: req.body.ownerId,
        shopName: req.body.shopName,
        gender: req.body.gender,
        about: req.body.about,
        contact: contactJson,
        // workingHours: JSON.parse( req.body.workingHours),
        tags: req.body.tags,
        shopLogo: path != "" ? url + "/" + path : "",
      };

      if (model.shopLogo == "") {
        delete model.shopLogo;
      }

      // //console.log(model);

      shopServices.createShop(model, (error, results) => {
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
        },
      };

      if (model.service_data.photo == "") {
        delete model.service_data.photo;
      }

      //console.log(model);

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
        },
      };

      if (model.service_data.photo == "") {
        delete model.service_data.photo;
      }

      //console.log(model);

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
      //console.log(error);
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
  const hash = req.body.hash;
  shopServices.verifyOTP(email, otp, hash, (error, results) => {
    if (error) {
      //console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getShop = (req, res, next) => {
  shopId = req.params.id;
  shopServices.getShopById(shopId, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getShops = (req, res, next) => {
  shopServices.getShops(req, (error, results) => {
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

      //console.log(model);

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

exports.getSlot = (req, res, next) => {
  let { shopId, memberId, date } = req.params;
  if (
    memberId == undefined ||
    memberId == null ||
    memberId == "" ||
    shopId == undefined ||
    shopId == null ||
    shopId == "" ||
    date == undefined ||
    date == null ||
    date == ""
  ) {
    return res.status(400).send({
      message: "Bad Request",
      data: "",
    });
  }
  try {
    date = new Date(date);
    date = getDDMMMYYYYDate(date);
  } catch (e) {
    return res.status(400).send({
      message: `Bad Request: ${e}`,
      data: "",
    });
  }
  
  console.log(date);
  const query = {
    shopId: shopId,
    memberId: memberId,
    date: date,
  };

  shopServices.getSlot(query, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
