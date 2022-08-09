const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const { Services } = require("../models/service.model");
const Tags = require("../models/tags.model");
const Appointment = require("../models/appointment.model");
const Reviews = require("../models/review.model");
const SlotBooking = require("../models/slotsBooking.model");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.js");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = process.env.CRYPTO_SECRET_KEY || "verySecretKey"; // Key for cryptography. Keep it secret
const { sendOTPMail } = require("../utils/mailer");

async function register(params, callback) {
  const { email } = params;
  // Check whether user already exists or not
  const user = await User.findOne({ email }).exec();
  // if user exist then return error
  if (user != null) {
    return callback({
      status: 400,
      message: "User already exists!",
    });
  }
  // if user does not exist then create new user
  const otp = otpGenerator.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  // Send OTP to user through email
  let msg =
    "Thank you for choosing Expertis. Use the following OTP to verify your account. OTP is valid for 5 minutes";
  sendOTPMail(email, otp, msg)
    .then((response) => {
      // Create new user in the database
      const user = new User(params);
      user
        .save()
        .then((response) => {
          const ttl = 5 * 60 * 1000; //5 Minutes in milliseconds
          const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
          const data = `${user._id}.${otp}.${expires}`; // phone.otp.expiry_timestamp
          const hash = crypto
            .createHmac("sha256", key)
            .update(data)
            .digest("hex"); // creating SHA256 hash of the data
          const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
          // Send hash to user for verification
          return callback(null, {
            hash: fullHash,
            email: user.email,
            id: user._id,
          });
        })
        .catch((error) => {
          return callback(error);
        });
    })
    .catch((err) => {
      return callback({ status: 400, message: "Email can't be sent" });
    });
}

async function verifyOTP(id, otp, hash, callback) {
  // Separate Hash value and expires from the hash returned from the user
  let [hashValue, expires] = hash.split(".");
  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires))
    return callback({ status: 400, message: "OTP Expired" });
  // Calculate new hash with the same key and the same algorithm
  let data = `${id}.${otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes

  if (newCalculatedHash === hashValue) {
    // Make user verified
    let doc = await User.findByIdAndUpdate(
      id,
      { verified: true },
      { useFindAndModify: true, new: true }
    );
    if (!doc)
      callback(
        `Cannot update Profile with id=${id}. Maybe user was not found!`
      );
    else {
      const user = await User.findById(id);
      const token = auth.generateAccessToken({
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.roles.isAdmin,
        isShopMember: user.roles.isShopMember,
        isShopOwner: user.roles.isShopOwner,
        isVerified: user.verified,
        dob: user.dob,
        phone: user.phone,
        gender: user.gender,
      });
      return callback(null, { ...doc.toJSON(), token });
    }
  } else {
    return callback("Invalid OTP");
  }
}

async function login(params, callback) {
  const { email, password } = params;
  // Find user by email
  const user = await User.findOne({ email }).populate({
    path: "shop",
    populate: { path: "services" },
  });
  // If user found
  if (user != null) {
    // Check if password is correct
    if (bcrypt.compareSync(password, user.password)) {
      // If user is not verified send OTP to verify user
      if (user.verified == false) {
        const otp = otpGenerator.generate(6, {
          alphabets: false,
          upperCase: false,
          specialChars: false,
        });
        const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
        const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
        const data = `${user._id}.${otp}.${expires}`; // phone.otp.expiry_timestamp
        const hash = crypto
          .createHmac("sha256", key)
          .update(data)
          .digest("hex"); // creating SHA256 hash of the data
        const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
        let msg =
          "Your email is not verified. Please verify your email by entering the OTP sent below. OTP is valid for 5 minutes";
        sendOTPMail(email, otp, msg)
          .then((response) => {
            return callback({
              status: 300,
              data: {
                hash: fullHash,
                email: user.email,
                id: user._id,
                message: "Verify your email, OTP sent to your email",
              },
            });
          })
          .catch((err) => {
            return callback({ status: 400, message: "Email can't be sent" });
          });
      } else {
        // If user is verified, generate token and return it
        const token = auth.generateAccessToken({
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.roles.isAdmin,
          isShopMember: user.roles.isShopMember,
          isShopOwner: user.roles.isShopOwner,
          isVerified: user.verified,
          dob: user.dob,
          phone: user.phone,
          gender: user.gender,
        });
        return callback(null, {
          ...user.toJSON(),
          token,
          message: "Login Successful",
        });
      }
    } else {
      return callback({
        status: 400,
        message: "Invalid Password!",
      });
    }
  } else {
    return callback({
      status: 400,
      message: "User does not exist!",
    });
  }
}

async function forgetPassword(email, callback) {
  const user = await User.findOne({ email });
  if (user != null) {
    const otp = otpGenerator.generate(6, {
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
    const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
    const data = `${email}.${otp}.${expires}`; // phone.otp.expiry_timestamp
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
    const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
    let msg =
      "Thank you for choosing Expertis. Use the following OTP to reset password pocess. OTP is valid for 5 minutes";
    sendOTPMail(email, otp, msg)
      .then((par) => {
        return callback(null, { hash: fullHash, email: user.email });
      })
      .catch((e) => {
        return callback("Email Not Sent");
      });
  } else {
    return callback({
      message: "Email Not Registered",
    });
  }
}

async function changePassword(params, callback) {
  User.findOneAndUpdate({ email: params.email }, params, {
    useFindAndModify: true,
  })
    .then((response) => {
      if (!response)
        callback(
          `Cannot update Profile with id=${params.id}. Maybe user was not found!`
        );
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function updateUser(userData, callback) {
  const userId = userData.id;

  let doc = await User.findByIdAndUpdate(userId, userData, {
    useFindAndModify: true,
    new: true,
  }).populate({ path: "shop", populate: { path: "services" } });
  if (!doc) {
    return callback({
      status: 400,
      message: "User does not exists",
    });
  }
  return callback(null, { ...doc.toJSON() });
}

async function resetPassword(params, callback) {
  const { id, newPassword, oldPassword } = params;
  const user = await User.findOne({ id });
  if (bcrypt.compareSync(oldPassword, user.password)) {
    User.findByIdAndUpdate(
      params.id,
      { password: newPassword },
      { useFindAndModify: true }
    )
      .then((response) => {
        if (!response)
          callback(
            `Cannot update Profile with id=${params.id}. Maybe user was not found!`
          );
        else callback(null, response);
      })
      .catch((error) => {
        return callback(error);
      });
  } else {
    return callback({
      message: "Invalid Password",
    });
  }
}

async function deleteUser(req, res, callback) {
  let { id } = req.params;
  const user = await User.findById(id);
  const req_user = await User.findById(req.user.id);
  // Check user authorization
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  if (user.id.toString() !== req.user.id) {
    if (req_user.roles.isAdmin === false) {
      return callback({ status: 400, message: "You are not authorized" });
    }
  }

  if (user.shop.length > 0) {
    const id = user.shop[0].toString();
    //delete the shop services
    await Services.deleteMany({ shop: id })
      .then(console.log("delete the services"))
      .catch((e) => {
        return callback(e);
      });
    //delete the shop reviews
    await Reviews.deleteMany({ to: id })
      .then(console.log("delete the shop review"))
      .catch((e) => {
        return callback(e);
      });
    //delete the shop appointments
    await Appointment.deleteMany({ shopId: id })
      .then(console.log("delete the appointments of the shop"))
      .catch((e) => {
        return callback(e);
      });
    //delete the shop SlotBooking
    await SlotBooking.deleteMany({ shopId: id })
      .then(console.log("delete the slot bookings of the shop"))
      .catch((e) => {
        return callback(e);
      });
    //delete the shop
    Shop.findByIdAndRemove(id)
      .then((response) => {
        console.log("delete the shop");
      })
      .catch((error) => {
        return callback(error);
      });
  }
  //delete the appointments of the user
  await Appointment.deleteMany({ userId: user.id.toString() })
    .then(console.log("delete appointments of the user"))
    .catch((error) => {
      return callback(error);
    });
  //delete the reviews of the user
  await Reviews.deleteMany({ from: user.id.toString() })
    .then(console.log("delete reviews of the user"))
    .catch((error) => {
      console.log(error);
    });
  //delete the user
  await user.remove();
  return callback(null, {
    status: 200,
    message: "User deleted successfully",
  });
}

async function getAllUser(req, callback) {
  let user = await User.findOne({ _id: req.user.id });

  if (!user.roles.isAdmin) {
    return callback({
      status: 400,
      message: "You are not authorized to get these data",
    });
  }

  await User.find()
    .populate({ path: "shop", populate: { path: "services" } })
    .then((response) => {
      if (!response) callback(`User not found`);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function getAdminAnalytics(req, callback) {
  let user = await User.findOne({ _id: req.user._id });
  if (!user.roles.isAdmin) {
    return res.status(400).send({
      message: "You are not authorized to get these data",
    });
  }
  const noOfUsers = await User.countDocuments();
  const noOfShops = await Shop.countDocuments();
  const noOfServices = await Services.countDocuments();
  const noOfTags = await Tags.countDocuments();
  const noOfAppointments = await Appointment.countDocuments();

  console.log(" noOfUsers ", noOfUsers);
  console.log(" noOfShops ", noOfShops);
  console.log(" noOfServices ", noOfServices);
  console.log(" noOfTags ", noOfTags);
  console.log(" noOfAppointments ", noOfAppointments);
  return callback(null, {
    noOfUsers,
    noOfShops,
    noOfServices,
    noOfTags,
    noOfAppointments,
  });
}

module.exports = {
  login,
  register,
  updateUser,
  forgetPassword,
  verifyOTP,
  changePassword,
  reset_password: resetPassword,
  deleteUser,
  getAllUser,
  getAdminAnalytics,
};
