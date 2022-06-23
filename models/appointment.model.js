const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const AppointmentSchema = new Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    pincode: {
      type: Number,
      required: false,
      maxlength: 6,
      minlength: 6,
    },
    shoplogo: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    verified: {
      type: Boolean,
      required: false,
      default: false,
    },
    isVeifyedByAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    gallery: {
      type: [String],
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    // services: {
    //     type: [ServiceSchema],
    //     required: false,
    // },
    services: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Services",
        },
      ],
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
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);
module.exports = Appointment;
