const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    dob: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      required: false,
    },

    role: {
      type: [String],
      enum: ["CUSTOMER", "OWNER", "BEAUTICIAN", "ADMIN"],
      default: ["CUSTOMER"],
      required: false,
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
    userPic: {
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
      required: true,
      default: false,
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
    shop: {

      type: Schema.Types.ObjectId,
      ref: "Shop",
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

UserSchema.methods.generateVerificationToken = function () {
  const user = this;
  console.log("user ", user._id);
  console.log(
    "process.env.USER_VERIFICATION_TOKEN_SECRET ",
    process.env.USER_VERIFICATION_TOKEN_SECRET
  );
  const verificationToken = jwt.sign(
    { ID: user._id },
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
UserSchema.set("toJSON", {
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
UserSchema.plugin(uniqueValidator, { message: "Email already in use." });

const User = mongoose.model("user", UserSchema);
module.exports = User;
