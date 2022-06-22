const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");


const ServiceSchema = new Schema({
  serviceName: {
    type: String,
  },
  price: {
    type: Number,
  },
  photo: {
    type: String,
    required: false,
  },
  time: {
    type: String,
  },
  discription: {
    type: String,
    required: false,
  },
  isVerifyedByAdmin: {
    type: String,
    required: false,
    default: false,
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
});
const Services = mongoose.model("Services", ServiceSchema);
module.exports = Services;
