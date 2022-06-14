const Shop = require("../models/shop.model");
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

async function login(params, callback) {
    const { email, password } = params;
    const shop = await Shop.findOne({ email });

    if (shop != null) {
        if (bcrypt.compareSync(password, shop.password)) {
            if (!shop.verified) {
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
                return callback(
                    {
                        message: "otp sent",
                        code: 302,
                        hash: fullHash,
                    }
                );
            }
            const token = auth.generateAccessToken(email);
            // call toJSON method applied during model instantiation
            return callback(null, { ...shop.toJSON(), token });
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

async function addservice(params, callback) {
    const { id } = params;

    const shop = await Shop.findByIdAndUpdate(id, {
        $push: {
            services: params.service_data
        }
    });

    if (shop != null) {


    } else {
        return callback({
            message: "Invalid ID",
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
        const shop = await Shop.findOne({ email });
        shop.verified = true;
        await shop.save();
        const token = auth.generateAccessToken(email);
        // call toJSON method applied during model instantiation
        return callback(null, { ...shop.toJSON(), token });
    }
    return callback("Invalid OTP");
}


module.exports = {
    register,
    login,
    verifyOTP,
    addservice,
};