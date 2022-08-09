const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");

router.post("/", reviewController.addReview);
router.get("/:id", reviewController.getReviews);
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;
