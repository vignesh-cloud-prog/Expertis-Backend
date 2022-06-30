const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const ReviewSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: [Schema.Types.ObjectId],
    refPath: "model_type",
  },
  model_type: {
    type: String,
    enum: ["Shop", "Service"],
    required: true,
  },
  photos: {
    type: [String],
    required: false,
  },
  comment: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
});

const Reviews = mongoose.model("Reviews", ReviewSchema);
module.exports = Reviews;
