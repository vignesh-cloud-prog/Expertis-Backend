const Shop = require("../models/shop.model");
const User = require("../models/user.model");
const Reviews = require("../models/review.model");
const jwt = require("jsonwebtoken");


async function addReview(params, callback) {
  const { from, to, model_type, comment, rating } = params;
  // //console.log(params);
  Reviews.findOneAndUpdate({ from, to, model_type }, params, { new: true, upsert: true }).then(res => {
    return callback(null, res);
  }).catch(e => {
    //console.log(e)
    return callback(e)

  })
  // Reviews.create(params)
}
async function updateReview(params, callback) {
  const { id } = params;
  Reviews.findByIdAndUpdate(id, params, { useFindAndModify: true, new: true, }).then(res => {
    //console.log(res);
    return callback(null, res);
  }).catch(e => {
    //console.log(e)
    return callback(e)

  })
}

async function deleteReview(params, callback) {
  to = params.params.shopId
  token = params.headers.authorization
  decoded = jwt.verify(token, process.env.TOKEN_SECRET || "secretKey");
  from = decoded.data
  let data = await Reviews.findOne({ from, to })
  console.log(data);
  if (!data) {
    return callback({ message: "no data found with user and shop exits" })

  }
  Reviews.findOneAndDelete({ from, to }).then(res => {
    console.log(res, "res");
    return callback(null, res);
  }).catch(e => {
    console.log(e, "err")
    return callback(e)

  })
}

async function getReviews(params, callback) {
  const { id } = params;
  Reviews.find({ to: id }).then(res => {
    //console.log(res);
    return callback(null, res);
  }
  ).catch(e => {
    //console.log(e)
    return callback(e)

  }
  )
}


module.exports = {
  addReview,
  updateReview,
  deleteReview,
  getReviews,
}