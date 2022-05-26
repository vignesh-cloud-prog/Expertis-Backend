const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth.js");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey"; // Key for cryptograpy. Keep it secret
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

async function send_otp(email, callback) {
  const user = await User.findOne({ email });
  if (user != null) {
    const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
    const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
    const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
    const data = `${email}.${otp}.${expires}`; // phone.otp.expiry_timestamp
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
    const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
    // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
    transporter.sendMail({
      to: email,
      subject: "Verify Account",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Expertis Inc</a>
        </div>
        <p style="font-size:1.1em">Verify,</p>
        <p>Thank you for choosing Expertis. Use the following OTP to reset password pocess. OTP is valid for 5 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />Expertis</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Expertis Inc</p>
          <p>Find your best</p>
          <p>India</p>
        </div>
      </div>
    </div>`,
    });
    console.log(`Your OTP is ${otp}. it will expire in 5 minutes`);
    return callback(null, fullHash);

  } else {
    return callback({
      message: "Invalid Email",
    });
  }
}

async function verifyOTP(email, otp, hash, callback) {
  // Separate Hash value and expires from the hash returned from the user
  let [hashValue, expires] = hash.split(".");
  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) return callback("OTP Expired");
  // Calculate new hash with the same key and the same algorithm
  let data = `${email}.${otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    const user = await User.findOne({ email });
    const token = auth.generateAccessToken(email);
    // call toJSON method applied during model instantiation
    return callback(null, { ...user.toJSON(), token });
  }
  return callback("Invalid OTP");
}

async function new_password(params, callback) {

  User.findByIdAndUpdate(params.id, params, { useFindAndModify: true })
    .then((response) => {
      if (!response)
        callback(
          `Cannot update Profile with id=${params.email}. Maybe user was not found!`
        );
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function reset_password(params, callback) {
  const { id, newPassword, oldPassword } = params
  const user = await User.findOne({ id });
  if (bcrypt.compareSync(oldPassword, user.password)) {
    User.findByIdAndUpdate(params.id, { "password": newPassword }, { useFindAndModify: true })
      .then((response) => {
        if (!response)
          callback(
            `Cannot update Profile with id=${params.email}. Maybe user was not found!`
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
};


module.exports = {
  login,
  register,
  verify,
  updateProfile,
  send_otp,
  verifyOTP,
  new_password,
  reset_password,
};
