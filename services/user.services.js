const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth.js");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey"; // Key for cryptograpy. Keep it secret
var msg91 = require("msg91")("1", "1", "1");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function login({ email, password }, callback) {
  const user = await User.findOne({ email });

  if (user != null) {
    if (bcrypt.compareSync(password, user.password)) {
      if (!user.verified) {
        const verificationToken = user.generateVerificationToken();
        console.log("sending email to ", user.email);
        // Step 3 - Email the user a unique verification link
        const url = `http://localhost:4000/users/verify/${verificationToken}`;
        console.log(url);
        transporter.sendMail({
          to: user.email,
          subject: "Verify Account",
          html: `Click <a href = '${url}'>here</a> to confirm your email.`,
        });
        return callback({
          message: "Verify your Account.",
        });
      }
      const token = auth.generateAccessToken(email);
      console.log(user, token);
      // call toJSON method applied during model instantiation
      return callback(null, { ...user.toJSON(), token });
    } else {
      return callback({
        message: "Invalid Password!",
      });
    }
  } else {
    return callback({
      message: "Invalid Email",
    });
  }
}

async function verify({ token }, callback) {
  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.USER_VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    return callback({ message: `Verification failed ${err}` });
  }
  try {
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      return callback({
        message: "User does not  exists",
      });
    }
    // Step 3 - Update user verification status to true
    user.verified = true;
    await user.save();
    return callback(null, { ...user.toJSON() });
  } catch (err) {
    return callback({ message: err });
  }
}

async function register(params, callback) {
  if (params.email === undefined) {
    console.log(params.email);
    return callback(
      {
        message: "Email Required",
      },
      ""
    );
  }

  if (params.phone === undefined) {
    console.log(params.email);
    return callback({
      message: "Phone Required",
    });
  }

  const user = new User(params);
  user
    .save()
    .then((response) => {
      // Step 2 - Generate a verification token with the user's ID
      console.log("generating token");
      const verificationToken = user.generateVerificationToken();
      console.log("sending email to ", user.email);
      // Step 3 - Email the user a unique verification link
      const url = `http://localhost:4000/users/verify/${verificationToken}`;
      console.log(url);
      transporter.sendMail({
        to: user.email,
        subject: "Verify Account",
        html: `Click <a href = '${url}'>here</a> to confirm your email.`,
      });
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function updateProfile(params, callback) {
  const userId = params.id;
  console.log(userId);

  User.findByIdAndUpdate(userId, params, { useFindAndModify: true })
    .then((response) => {
      if (!response)
        callback(
          `Cannot update Profile with id=${userId}. Maybe user was not found!`
        );
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

module.exports = {
  login,
  register,
  verify,
  updateProfile,
};
