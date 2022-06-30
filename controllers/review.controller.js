const reviewServices = require("../services/review.services");


exports.addReview = (req, res, next) => {
  // console.log(req);
  console.log("addReview ", req.Body);
  // res.send({message:"success"});
  reviewServices.addReview(req.body, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
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
