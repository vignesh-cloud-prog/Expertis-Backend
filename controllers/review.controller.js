const reviewServices = require("../services/review.services");
const { uploadReviewPic } = require("../middlewares/upload.js");


exports.addReview = (req, res, next) => {
  uploadReviewPic(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const url = req.protocol + "://" + req.get("host");

      const path =
        req.file != undefined ? req.file.path.replace(/\\/g, "/") : "";

      var model = req.body

      console.log(model);

      // shopServices.updateShop(model, (error, results) => {
      //   if (error) {
      //     return next(error);
      //   }
      //   return res.status(200).send({
      //     message: "Success",
      //     data: results,
      //   });
      // });
    }
  });
};

exports.updateReview = (req, res, next) => {
  console.log(req.body);
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
