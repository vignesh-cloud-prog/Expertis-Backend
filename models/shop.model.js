const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const SlotsBookedSchema = new Schema({
  date: {
    type: String,
    unique: true,
    required: true,
  },
  slots: [Number],
});

SlotsBookedSchema.plugin(uniqueValidator, { message: "Date should be unique." });


const ShopSchema = new Schema(
  {
    owner: {
      type: String,
      required: false,
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
    phone: {
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
    slotsBooked: { type: [SlotsBookedSchema], unique: true },
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

ShopSchema.methods.generateVerificationToken = function () {
  const shop = this;
  console.log("shop ", shop._id);
  console.log(
    "process.env.USER_VERIFICATION_TOKEN_SECRET ",
    process.env.USER_VERIFICATION_TOKEN_SECRET
  );
  const verificationToken = jwt.sign(
    { ID: shop._id },
    process.env.USER_VERIFICATION_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return verificationToken;
};

/**
 *  Here we are creating and setting an id property and 
    removing _id, __v, and the password hash which we do not need 
    to send back to the client.
 */
ShopSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    //do not reveal passwordHash
    delete returnedObject.password;
  },
});

/**
 * 1. The userSchema.plugin(uniqueValidator) method won’t let duplicate email id to be stored in the database.
 * 2. The unique: true property in email schema does the internal optimization to enhance the performance.
 */
ShopSchema.plugin(uniqueValidator, { message: "Email already in use." });

const Shop = mongoose.model("Shop", ShopSchema);
module.exports = Shop;
