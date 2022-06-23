const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");


const TagSchema = new Schema({
  tagName: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: false,
  },
  discription: {
    type: String,
    required: false,
  },
  isVerifiedByAdmin: {
    type: String,
    required: false,
    default: false,
  },
  shops: [{
    type: Schema.Types.ObjectId,
    ref: "Shop",
  }],
  services: [{
    type: Schema.Types.ObjectId,
    ref: "Services",
  }],

});
TagSchema.plugin(uniqueValidator, { message: "Tag already exist." });

const Tags = mongoose.model("Tags", TagSchema);
module.exports = Tags;
