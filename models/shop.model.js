const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const ShopRatingSchema = new Schema({
  avg: {
    type: Number,
    default: 0
  },
  oneStar: {
    type: Number,
    default: 0
  },
  twoStar: {
    type: Number,
    default: 0
  },
  threeStar: {
    type: Number,
    default: 0
  },
  fourStar: {
    type: Number,
    default: 0
  },
  fiveStar: {
    type: Number,
    default: 0
  },
  totalMembers: {
    type: Number,
    default: 0
  },
});
const ShopSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    beauticians: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    shopName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: Number,
      unique: [true, "Phone number should be unique"],
      required: [true, "Phone number is required"],
    },
    address: {
      type: String,
      required: false,
    },
    pinCode: {
      type: Number,
      required: false,
      min: [6, "Minimum 6 digit Pin Code"],
      max: [6, "Maximum 6 digit Pin Code"],
    },
    shopLogo: {
      type: String,
      required: false,
    },
    isVerifiedByAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    rating: {
      type: ShopRatingSchema
    },
    gallery: {
      type: [String],
      required: false,
    },


    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Tags",
        },
      ],
      required: false,
    },
    slotsBooked: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "SlotBooking",
        },
      ],
    },
    services: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      required: false,
    },
    appointments: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Appointment",
        },
      ],
    },
  },
  { timestamps: true }
);

ShopSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

/**
 * 1. The userSchema.plugin(uniqueValidator) method won’t let duplicate email id to be stored in the database.
 * 2. The unique: true property in email schema does the internal optimization to enhance the performance.
 */
ShopSchema.plugin(uniqueValidator, { message: "Email already in use." });

const Shop = mongoose.model("Shop", ShopSchema);
module.exports = Shop;
