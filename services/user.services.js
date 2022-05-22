const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth.js");

const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey"; // Key for cryptograpy. Keep it secret
var msg91 = require("msg91")("1", "1", "1");
const nodemailer = require('nodemailer');


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
      const token = auth.generateAccessToken(email);
      // call toJSON method applied during model instantiation
      return callback(null, { ...user.toJSON(), token });
    } else {
      return callback({
        message: "Invalid Email/Password!",
      });
    }
  } else {
    return callback({
      message: "Invalid Email/Password!",
    });
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
    return callback(
      {
        message: "Phone Required",
      },
      ""
    );
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
       const url = `http://localhost:4000/api/verify/${verificationToken}`
       transporter.sendMail({
         to: user.email,
         subject: 'Verify Account',
         html: `Click <a href = '${url}'>here</a> to confirm your email.`
       })
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

function sendOTP(){
  const http = require("https");

const options = {
	"method": "POST",
	"hostname": "d7-verify.p.rapidapi.com",
	"port": null,
	"path": "/send",
	"headers": {
		"content-type": "application/json",
		"Authorization": "undefined",
		"X-RapidAPI-Host": "d7-verify.p.rapidapi.com",
		"X-RapidAPI-Key": "a04ac332b7mshfce24d2a4ca1184p10486fjsnd8c20a6b77ac",
		"useQueryString": true
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.write(JSON.stringify({
  expiry: 900,
  message: 'Your otp code is {code}',
  mobile: 917338085595,
  sender_id: 'SMSInfo'
}));
req.end();
}

async function updateProfile(params, callback) {
  const userId = params.id;
  console.log(userId);

  User
    .findByIdAndUpdate(userId, params, { useFindAndModify: true })
    .then((response) => {
      if (!response) callback(`Cannot update Profile with id=${userId}. Maybe user was not found!`);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function createNewOTP(params, callback) {
  // Generate a 4 digit numeric OTP
  const otp = otpGenerator.generate(4, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
  const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
  const data = `${params.phone}.${otp}.${expires}`; // phone.otp.expiry_timestamp
  const hash = crypto.createHmac("sha256", key).update(data).digest("hex"); // creating SHA256 hash of the data
  const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
  // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
  //sendSMS(phone, `Your OTP is ${otp}. it will expire in 5 minutes`);

  console.log(`Your OTP is ${otp}. it will expire in 5 minutes`);

  var otpMessage = `Dear Customer, ${otp} is the One Time Password ( OTP ) for your login.`;

  sendOTP();
  msg91.send(`+91${params.phone}`, otpMessage, function (err, response) {
    console.log(response);
  });

  return callback(null, fullHash);
}

async function verifyOTP(params, callback) {
  // Separate Hash value and expires from the hash returned from the user
  let [hashValue, expires] = params.hash.split(".");
  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) return callback("OTP Expired");
  // Calculate new hash with the same key and the same algorithm
  let data = `${params.phone}.${params.otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    return callback(null, "Success");
  }
  return callback("Invalid OTP");
}

module.exports = {
  login,
  register,
  updateProfile,
  createNewOTP,
  verifyOTP,
};
