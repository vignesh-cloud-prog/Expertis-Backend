const shopServices = require("../services/shop.services");
const {
  uploadShopLogo,
  uploadServicePhoto,
} = require("../middleware/upload.js");
const { getDDMMMYYYYDate, isValidVariable } = require("../utils/utils");

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

exports.getShopById = (req, res, next) => {
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
exports.getShopByShopId = (req, res, next) => {
  shopId = req.params.shopId;
  shopServices.getShopByShopId(shopId, (error, results) => {
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
      if (isValidVariable(owner)) {
        console.log("owner ", owner);
        console.log("user ", req.user);
        if (owner != req.user.id) {
          if (!req.user.isAdmin)
            return res.status(401).send({
              message: "You are not authorized to update this shop",
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
      if (isValidVariable(shopId)) {
        model.shopId = shopId;
      }
      if (isValidVariable(shopName)) {
        model.shopName = shopName;
      }
      if (isValidVariable(about)) {
        model.about = about;
      }
      if (isValidVariable(tags)) {
        model.tags = tags;
      }
      if (isValidVariable(isActive)) {
        model.isActive = isActive;
      }
      if (isValidVariable(isOpen)) {
        model.isOpen = isOpen;
      }
      if (isValidVariable(shopLogoUrl)) {
        model.shopLogo = shopLogoUrl;
      }
      let contact = {};
      if (isValidVariable(email)) {
        contact.email = email;
      }
      if (isValidVariable(website)) {
        contact.website = website;
      }
      if (isValidVariable(phone)) {
        contact.phone = phone;
      }
      if (isValidVariable(gender)) {
        model.gender = gender;
      }
      if (isValidVariable(address)) {
        contact.address = address;
      }
      if (isValidVariable(pinCode)) {
        contact.pinCode = pinCode;
      }
      if (isValidVariable(whatsapp)) {
        contact.whatsapp = whatsapp;
      }
      if (isValidVariable(facebook)) {
        contact.facebook = facebook;
      }
      if (isValidVariable(instagram)) {
        contact.instagram = instagram;
      }
      if (isValidVariable(twitter)) {
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


