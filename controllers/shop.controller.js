const shopServices = require("../services/shop.services");
const {
  uploadShopLogo,
  uploadServicePhoto,
} = require("../middleware/upload.js");
const { getDDMMMYYYYDate, checkVariable } = require("../utils/utils");

exports.createShop = (req, res, next) => {
  uploadShopLogo(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        shopId: req.body.shopId,
        owner: req.body.owner,
        shopName: req.body.shopName,
        gender: req.body.gender,
        about: req.body.about,
        contact: {
          email: req.body.email,
          phone: req.body.phone,
        },
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
        id: req.body.shop,
        service_data: {
          serviceName: req.body.serviceName,
          price: req.body.price,
          time: req.body.time,
          tags: req.body.tags,
          description: req.body.description,
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
        id: req.body.id,
        service_data: {
          serviceName: req.body.serviceName,
          price: req.body.price,
          time: req.body.time,
          tags: req.body.tags,
          description: req.body.description,
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
      const {
        owner,
        shopId,
        shopName,
        about,
        gender,
        email,
        website,
        phone,
        address,
        pinCode,
        whatsapp,
        facebook,
        instagram,
        twitter,
        tags,
        isActive,
        isOpen,
      } = req.body;
      if (checkVariable(owner)) {
        console.log("owner ", owner);
        console.log("user ", req.user);
        if (owner != req.user) {
          return res.status(401).send({
            message: "Unauthorized",
            data: "",
          });
        }
      } else {
        return res.status(400).send({
          message: "Owner Id is required",
          data: "",
        });
      }
      // TODO: Working Hours

      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      let shopLogoUrl = path != "" ? url + "/" + path : "";
      var model = {
        id: req.body.id,
      };
      if (checkVariable(shopId)) {
        model.shopId = shopId;
      }
      if (checkVariable(shopName)) {
        model.shopName = shopName;
      }
      if (checkVariable(about)) {
        model.about = about;
      }
      if (checkVariable(tags)) {
        model.tags = tags;
      }
      if (checkVariable(isActive)) {
        model.isActive = isActive;
      }
      if (checkVariable(isOpen)) {
        model.isOpen = isOpen;
      }
      if (checkVariable(shopLogoUrl)) {
        model.shopLogo = shopLogoUrl;
      }
      let contact = {};
      if (checkVariable(email)) {
        contact.email = email;
      }
      if (checkVariable(website)) {
        contact.website = website;
      }
      if (checkVariable(phone)) {
        contact.phone = phone;
      }
      if (checkVariable(gender)) {
        model.gender = gender;
      }
      if (checkVariable(address)) {
        contact.address = address;
      }
      if (checkVariable(pinCode)) {
        contact.pinCode = pinCode;
      }
      if (checkVariable(whatsapp)) {
        contact.whatsapp = whatsapp;
      }
      if (checkVariable(facebook)) {
        contact.facebook = facebook;
      }
      if (checkVariable(instagram)) {
        contact.instagram = instagram;
      }
      if (checkVariable(twitter)) {
        contact.twitter = twitter;
      }
      if (Object.keys(contact).length > 0) {
        model.contact = contact;
      }

      console.log("model ", model);

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

exports.getServices = (req, res, next) => {
  let id = req.params.id;
  shopServices.getServices(id, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
