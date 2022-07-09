const reviewServices = require("../services/review.services");
const { uploadReviewPhoto } = require("../middleware/upload.js");


exports.addReview = (req, res, next) => {

  uploadReviewPhoto(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = {
        from: req.body.from,
        to: req.body.to,
        rating: req.body.rating,
        model_type: req.body.model_type,
        comment: req.body.comment,
        reviewPhotos: path != "" ? url + "/" + path : "",
      };
      //console.log(model);


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

exports.updateReview = (req, res, next) => {
  //console.log(req.body);
  reviewServices.updateReview(req.body, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.deleteReview = (req, res, next) => {
  reviewServices.deleteReview(req.body, (error, results) => {
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
}
