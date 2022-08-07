const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
const { TOKEN_EXPIRATION_TIME } = require("../utils/constants.js");
const { defaultRoles } = require("../utils/defaults.js");

const RolesSchema = new Schema({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isUser: {
    type: Boolean,
    default: true,
  },
  isShopOwner: {
    type: Boolean,
    default: false,
  },
  isShopMember: {
    type: Boolean,
    default: false,
  },
});

RolesSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

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
    },
    dob: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHERS"],
      required: false,
    },

    roles: { type: RolesSchema, default: defaultRoles },
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
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    favoriteShops: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Shop",
        },
      ],
      required: false,
    },
    shop: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Shop",
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

UserSchema.methods.generateVerificationToken = function () {
  const user = this;
  //console.log("user ", user._id);
  //console.log("process.env.USER_VERIFICATION_TOKEN_SECRET",
  // process.env.USER_VERIFICATION_TOKEN_SECRET || "secret"
  // );
  //console.log("TOKEN_EXPIRATION_TIME ", TOKEN_EXPIRATION_TIME);
  const verificationToken = jwt.sign(
    { ID: user._id },
    process.env.USER_VERIFICATION_TOKEN_SECRET || "secret",
    { expiresIn: TOKEN_EXPIRATION_TIME }
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
