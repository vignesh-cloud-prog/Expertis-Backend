const shopServices = require("../services/shop.services");
const bcrypt = require("bcryptjs");
const upload = require("../middlewares/upload.js");

exports.register = (req, res, next) => {
    const { password } = req.body;
  
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

  exports.login = (req, res, next) => {
    const { email, password } = req.body;
  
    shopServices.login({ email, password }, (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    });
  };