const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const ReviewSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      refPath: "model_type",
      required: true,
    },
    model_type: {
      type: String,
      enum: ["Shop", "Service"],
      required: true,
    },
    reviewPhotos: {
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
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Reviews = mongoose.model("Reviews", ReviewSchema);
module.exports = Reviews;
