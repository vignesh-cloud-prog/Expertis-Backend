const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");

router.post("/", reviewController.addReview);
router.put("/rev", reviewController.updateReview);
router.get("/:id", reviewController.getReviews);
router.delete("/:id", reviewController.deleteReview);

module.exports = router