const reviewServices = require("../services/review.services");
const { uploadReviewPhoto } = require("../middleware/upload.js");
const jwt = require("jsonwebtoken");

exports.addReview = (req, res, next) => {
  uploadReviewPhoto(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      var model = {
        from: req.user.id,
        to: req.body.to,
        rating: req.body.rating,
        model_type: req.body.model_type,
        comment: req.body.comment,
        reviewPhotos: req.file && req.file.cloudinaryUrl ? req.file.cloudinaryUrl : (req.file ? (req.protocol + "://" + req.get("host") + "/" + req.file.path.replace(/\\/g, "/")) : ""),
        title: req.body.title,
      };
      reviewServices.addReview(model, (error, results) => {
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

exports.deleteReview = (req, res, next) => {
  reviewServices.deleteReview(req, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getReviews = (req, res, next) => {
  reviewServices.getReviews(req.params, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};
