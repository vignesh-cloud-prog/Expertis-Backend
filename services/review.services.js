const Shop = require("../models/shop.model");
const User = require("../models/user.model");
const Reviews = require("../models/review.model");

async function addReview(params, callback) {
  const { from, to, model_type, comment, rating } = params;

  console.log(rating);
  let shop = await Shop.findById(to);
  if (!shop) {
    return callback({
      status: 400,
      message: "Shop not found",
    });
  }

  if (rating > 5 || rating < 0.5) {
    return callback({
      status: 400,
      message: "Invalid Rating",
    });
  }
  // Find user old review
  let review = await Reviews.findOne({ from, to });
  let shopRating = shop.rating;
  console.log(review);
  // if user has already reviewed the shop then delete the old review
  if (review) {
    let rating = parseFloat(review.rating);
    if (rating > 4) {
      shopRating.fiveStar -= 1;
    } else if (rating > 3) {
      shopRating.fourStar -= 1;
    } else if (rating > 2) {
      shopRating.threeStar -= 1;
    } else if (rating > 1) {
      shopRating.twoStar -= 1;
    } else if (rating > 0) {
      shopRating.oneStar -= 1;
    }
    shopRating.totalMembers -= 1;
  }

  console.log("Decremented rating", shopRating);

  console.log(shopRating, "shopRating");
  // if user has not reviewed the shop then add new review
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

  console.log("Incremented Rating ", shopRating);
  let noOfRating =
    shopRating.oneStar +
    shopRating.twoStar +
    shopRating.threeStar +
    shopRating.fourStar +
    shopRating.fiveStar;
  let ratingSum =
    shopRating.oneStar * 1 +
    shopRating.twoStar * 2 +
    shopRating.threeStar * 3 +
    shopRating.fourStar * 4 +
    shopRating.fiveStar * 5;

  shopRating.avg = ratingSum / noOfRating;

  console.log("no of rating ", noOfRating);
  console.log("totalSum", ratingSum);
  console.log("avg", shopRating.avg);

  Reviews.findOneAndUpdate({ from, to, model_type }, params, {
    new: true,
    upsert: true,
  })
    .populate("from", "name email roles userPic")
    .then(async (res) => {
      let shopId = res.to;
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
      console.log("updatedShop", updatedShop.rating);

      return callback(null, updatedShop);
    })
    .catch((e) => {
      //console.log(e)
      return callback(e);
    });
  // Reviews.create(params)
}

async function deleteReview(params, callback) {
  to = params.params.shopId;
  from = params.user.id;
  let data = await Reviews.findOne({ from, to });
  console.log(data);
  if (!data) {
    return callback({ message: "no data found with user and shop exits" });
  }
  Reviews.findOneAndDelete({ from, to })
    .populate("from", "name email roles userPic")
    .then((res) => {
      console.log(res, "res");
      return callback(null, res);
    })
    .catch((e) => {
      console.log(e, "err");
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
      //console.log(e)
      return callback(e);
    });
}

module.exports = {
  addReview,
  deleteReview,
  getReviews,
};
