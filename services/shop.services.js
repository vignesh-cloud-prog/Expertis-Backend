const Shop = require("../models/shop.model");
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
    const { email } = params;
    const shop = await Shop.findOne({ email });
    if (shop == null) {

        const shop = new Shop(params);
        shop
            .save()
            .then((response) => {
                console.log(params.email)
                const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
                const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
                const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
                const data = `${params.email}.${otp}.${expires}`; // phone.otp.expiry_timestamp
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
            })
            .catch((error) => {
                console.log(error);
                return callback(error);
            });
    } else {
        return callback({
            message: "Email allready exist try to login",
        });
    }
}

async function login({ email, password }, callback) {
    const shop = await Shop.findOne({ email });

    if (shop != null) {
        if (bcrypt.compareSync(password, user.password)) {
            if (!shop.verified) {
                const verificationToken = shop.generateVerificationToken();
                console.log("sending email to ", shop.email);
                // Step 3 - Email the user a unique verification link
                const url = `http://localhost:4000/users/verify/${verificationToken}`;
                console.log(url);
                transporter.sendMail({
                    to: shop.email,
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
                return callback({
                    message: "Verify your Account.",
                });
            }
            const token = auth.generateAccessToken(email);
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


module.exports = {
    register,
    login,
};