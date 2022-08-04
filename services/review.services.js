const Shop = require("../models/shop.model");
const User = require("../models/user.model");
const Reviews = require("../models/review.model");
const jwt = require("jsonwebtoken");


async function addReview(params, callback) {
  const { from, to, model_type, comment, rating } = params;
  // //console.log(params);
  Reviews.findOneAndUpdate({ from, to, model_type }, params, { new: true, upsert: true }).populate('from', 'name email roles userPic').then(res => {
    return callback(null, res);
  }).catch(e => {
    //console.log(e)
    return callback(e)

  })
  // Reviews.create(params)
}
async function updateReview(params, callback) {
  const { id } = params;
  Reviews.findByIdAndUpdate(id, params, { useFindAndModify: true, new: true, }).populate('from', 'name email roles userPic').then(res => {
    //console.log(res);
    return callback(null, res);
  }).catch(e => {
    //console.log(e)
    return callback(e)

  })
}

async function deleteReview(params, callback) {
  to = params.params.shopId
  from = params.user.id
  let data = await Reviews.findOne({ from, to })
  console.log(data);
  if (!data) {
    return callback({ message: "no data found with user and shop exits" })

  }
  Reviews.findOneAndDelete({ from, to }).populate('from', 'name email roles userPic').then(res => {
    console.log(res, "res");
    return callback(null, res);
  }).catch(e => {
    console.log(e, "err")
    return callback(e)

  })
}

async function getReviews(params, callback) {
  const { id } = params;
  Reviews.find({ to: id }).populate('from', 'name email roles userPic').then(res => {
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