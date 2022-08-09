const Shop = require("../models/shop.model");
const User = require("../models/user.model");
const Reviews = require("../models/review.model");

function addShopRatingInfo(shopRating, rating) {
  if (rating > 4) {
    shopRating.fiveStar = shopRating.fiveStar + 1;
  } else if (rating > 3) {
    shopRating.fourStar = shopRating.fourStar + 1;
  } else if (rating > 2) {
    shopRating.threeStar = shopRating.threeStar + 1;
  } else if (rating > 1) {
    shopRating.twoStar = shopRating.twoStar + 1;
  } else if (rating > 0) {
    shopRating.oneStar = shopRating.oneStar + 1;
  }
  shopRating.totalMembers = shopRating.totalMembers + 1;

  return shopRating;
}

function removeShopRatingInfo(shopRating, rating) {
  if (rating > 4) {
    shopRating.fiveStar = shopRating.fiveStar - 1;
  } else if (rating > 3) {
    shopRating.fourStar = shopRating.fourStar - 1;
  } else if (rating > 2) {
    shopRating.threeStar = shopRating.threeStar - 1;
  } else if (rating > 1) {
    shopRating.twoStar = shopRating.twoStar - 1;
  } else if (rating > 0) {
    shopRating.oneStar = shopRating.oneStar - 1;
  }
  shopRating.totalMembers = shopRating.totalMembers - 1;

  return shopRating;
}

function getRatingSum(shopRating) {
  return (
    shopRating.fiveStar * 5 +
    shopRating.fourStar * 4 +
    shopRating.threeStar * 3 +
    shopRating.twoStar * 2 +
    shopRating.oneStar * 1
  );
}

async function addOrUpdateReview(params, callback) {
  const { from, to, model_type, comment, rating } = params;
  let shop = await Shop.findById(to);
  let user = await User.findById(from);
  if (shop == null) {
    return callback({ status: 404, message: "Shop not found" });
  }
  if (user == null) {
    return callback({ status: 404, message: "User not found" });
  }
  // Check is rating is valid
  if (rating > 5 || rating < 0.5) {
    return callback({
      status: 400,
      message: "Invalid Rating",
    });
  }
  let shopRating = shop.rating;
  // Find user old review
  let review = await Reviews.findOne({ from, to });
  if (review !== null) {
    // if user has already reviewed the shop then decrement the old review
    let rating = parseFloat(review.rating);
    shopRating = removeShopRatingInfo(shopRating, rating);
  }
  // Add new review
  shopRating = addShopRatingInfo(shopRating, rating);
  // Calculate new rating of shop
  let ratingSum = getRatingSum(shopRating);
  shopRating.avg = parseInt(ratingSum / shopRating.totalMembers) || 3;
  // Create or update review
  Reviews.findOneAndUpdate({ from, to, model_type }, params, {
    new: true,
    upsert: true,
  })
    .populate("from", "name email roles userPic")
    .then(async (res) => {
      let shopId = res.to;
      // Update shop rating
      let updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        {
          rating: shopRating,
          $addToSet: {
            reviews: res._id,
          },
        },
        { new: true }
      );
      return callback(null, updatedShop);
    })
    .catch((e) => {
      return callback(e);
    });
}

async function deleteReview(req, callback) {
  const reviewId = req.params.reviewId;

  Reviews.findByIdAndDelete(reviewId)
    .populate("from", "name email roles userPic")
    .then(async (res) => {
      if (res == null) {
        return callback({ status: 404, message: "Review not found" });
      }
      // Update shop rating
      let shop = await Shop.findById(res.to);
      let shopRating = shop.rating;
      let rating = parseFloat(res.rating);
      shopRating = removeShopRatingInfo(shopRating, rating);
      let ratingSum = getRatingSum(shopRating);
      shopRating.avg = parseInt(ratingSum / shopRating.totalMembers) || 3;
      let updatedShop = await Shop.findByIdAndUpdate(
        res.to,
        {
          rating: shopRating,
          $pull: {
            reviews: res._id,
          },
        },
        { new: true }
      );
      return callback(null, updatedShop);
    })
    .catch((e) => {
      return callback(e);
    });
}

async function getReviews(params, callback) {
  const { id } = params;
  Reviews.find({ to: id })
    .populate("from", "name email roles userPic")
    .then((res) => {
      return callback(null, res);
    })
    .catch((e) => {
      return callback(e);
    });
}

module.exports = {
  addReview: addOrUpdateReview,
  deleteReview,
  getReviews,
};
