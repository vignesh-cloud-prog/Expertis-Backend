const tagServices = require("../services/tag.services");
const { uploadTagPic } = require("../middleware/upload");

exports.createTag = (req, res, next) => {
  uploadTagPic(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      var model = {
        tagName: req.body.tagName,
        tagPic: req.file && req.file.cloudinaryUrl ? req.file.cloudinaryUrl : (req.file ? (req.protocol + "://" + req.get("host") + "/" + req.file.path.replace(/\\/g, "/")) : ""),
        description: req.body.description,
      };
      tagServices.createTag(model, (error, results) => {
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
  uploadTagPic(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const { tagName, description } = req.body;
      let model = {
        id: req.body.id,
      };
      const tagPicUrl = req.file && req.file.cloudinaryUrl ? req.file.cloudinaryUrl : (req.file ? (req.protocol + "://" + req.get("host") + "/" + req.file.path.replace(/\\/g, "/")) : "");
      if (tagPicUrl != "" && tagPicUrl !== undefined && tagPicUrl !== null) {
        model.tagPic = tagPicUrl;
      }
      if (tagName != "" && tagName !== undefined && tagName !== null) {
        model.tagName = tagName;
      }
      if (
        description != "" &&
        description !== undefined &&
        description !== null
      ) {
        model.description = description;
      }
      tagServices.updateTag(model, (error, results) => {
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
