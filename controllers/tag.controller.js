const tagServices = require("../services/tag.services");

exports.addTag = (req, res, next) => {
  console.log(req.body);
  tagServices.addTag(req.body, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getTags = (req, res, next) => {
  tagServices.getTags(req.params, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.updateTag = (req, res, next) => {
  tagServices.updateTag(req.body, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.deleteTag = (req, res, next) => {
  tagServices.deleteTag(req.params, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
