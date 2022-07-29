const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.js");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "verysecretkey"; // Key for cryptograpy. Keep it secret
const nodemailer = require("nodemailer");
const { strict } = require("assert");
const { isAuthorizedUser } = require("../utils/utils");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function login(params, callback) {
  const { email, password } = params;
  const user = await User.findOne({ email });

  if (user != null) {
    if (bcrypt.compareSync(password, user.password)) {
      if (user.verified == false) {
        //console.log("User not verified");
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
        // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
        await transporter
          .sendMail({
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
          })
          .then((response) => {
            //console.log(`Your OTP is ${otp} . it will expire in 5 minutes`);
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
        const token = auth.generateAccessToken(user._id);
        //console.log(user, token);
        // call toJSON method applied during model instantiation
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
    const user = await User.findOneAndUpdate(
      { _id: payload.ID },
      { verified: true },
      { new: true }
    );
    //console.log(user);
    if (!user) {
      return callback({
        message: "User does not  exists",
      });
    }
    // Step 3 - Update user verification status to true
    // user.verified = true;
    // await user.save()
    return callback(null, { ...user.toJSON() });
  } catch (err) {
    return callback({ message: err });
  }
}

async function register(params, callback) {
  const { email } = params;
  //console.log("email", email);
  const user = await User.findOne({ email }).exec();
  if (user != null) {
    return callback({
      status: 400,
      message: "User already exists!",
    });
  }
  const otp = otpGenerator.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
  transporter
    .sendMail({
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
    })
    .then((response) => {
      //console.log("OTP response", response);
      //console.log(`Your OTP is ${otp} . it will expire in 5 minutes`);

      const user = new User(params);
      user
        .save()
        .then((response) => {
          //console.log(response);
          //console.log(user._id);

          const ttl = 5 * 60 * 1000; //5 Minutes in miliseconds
          const expires = Date.now() + ttl; //timestamp to 5 minutes in the future
          const data = `${user._id}.${otp}.${expires}`; // phone.otp.expiry_timestamp
          const hash = crypto
            .createHmac("sha256", key)
            .update(data)
            .digest("hex"); // creating SHA256 hash of the data
          const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
          return callback(null, {
            hash: fullHash,
            email: user.email,
            id: user._id,
          });
        })
        .catch((error) => {
          //console.log(error);
          return callback(error);
        });
    })
    .catch((err) => {
      //console.log(err);
      return callback({ status: 400, message: "Email can't be sent" });
    });
}

async function updateUser(body, callback) {
  const userId = body.id;
  //console.log(userId);

  let userData= await User.findByIdAndUpdate(userId, body, { useFindAndModify: true, new: true })
  if (!userData) {
    return callback({
      status: 400,
      message: "User does not exists",
    });
  }
  // if (userData.shop.length > 0) {
  //   //console.log("No shops");
  //   await userData.populate('shop');
  // }
  return callback(null, { ...userData.toJSON() });
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
    // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
    transporter
      .sendMail({
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
      })
      .then((par) => {
        //console.log("Email sent", par);
        //console.log(`Your OTP is ${otp}. it will expire in 5 minutes`);
        return callback(null, { hash: fullHash, email: user.email });
      })
      .catch((e) => {
        //console.log("Unable to send email", e);
        return callback("Email Not Sent");
      });
  } else {
    return callback({
      message: "Email Not Registered",
    });
  }
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
    //console.log("matched");
    let doc = await User.findByIdAndUpdate(
      id,
      { verified: true },
      { useFindAndModify: true, new: true }
    );
    //console.log(doc);
    if (!doc)
      callback(
        `Cannot update Profile with id=${id}. Maybe user was not found!`
      );
    else {
      const token = auth.generateAccessToken(doc._id);
      return callback(null, { ...doc.toJSON(), token });
    }
  } else {
    return callback("Invalid OTP");
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

async function reset_password(params, callback) {
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

function sendVerificationMail(email, token, host) {
  //console.log("sending email to ", email);

  // Step 3 - Email the user a unique verification link
  const url = `http://${host}/users/verify/${token}`;
  //console.log(url);
  transporter.sendMail({
    to: email,
    subject: "Verify Your Expertis Account",
    html: `
        
        <!DOCTYPE html>
<html>
<head>

  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Email Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
  /**
   * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
   */
  @media screen {
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 400;
      src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
    }
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 700;
      src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
    }
  }
  /**
   * Avoid browser level font resizing.
   * 1. Windows Mobile
   * 2. iOS / OSX
   */
  body,
  table,
  td,
  a {
    -ms-text-size-adjust: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }
  /**
   * Remove extra space added to tables and cells in Outlook.
   */
  table,
  td {
    mso-table-rspace: 0pt;
    mso-table-lspace: 0pt;
  }
  /**
   * Better fluid images in Internet Explorer.
   */
  img {
    -ms-interpolation-mode: bicubic;
  }
  /**
   * Remove blue links for iOS devices.
   */
  a[x-apple-data-detectors] {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
    text-decoration: none !important;
  }
  /**
   * Fix centering issues in Android 4.4.
   */
  div[style*="margin: 16px 0;"] {
    margin: 0 !important;
  }
  body {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  /**
   * Collapse table borders to avoid space between cells.
   */
  table {
    border-collapse: collapse !important;
  }
  a {
    color: #1a82e2;
  }
  img {
    height: auto;
    line-height: 100%;
    text-decoration: none;
    border: 0;
    outline: none;
  }
  </style>

</head>
<body style="background-color: #e9ecef;">

  <!-- start preheader -->
  <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Thank you for registering with Expertis, Verify your email
  </div>
  <!-- end preheader -->

  <!-- start body -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">

    <!-- start shoplogo -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" valign="top" style="padding: 36px 24px;">
              <a href="https://sendgrid.com" target="_blank" style="display: inline-block;">
                <img src="https://media.istockphoto.com/vectors/creative-icon-of-a-half-brain-half-lightbulb-representing-ideas-vector-id1159741374?k=20&m=1159741374&s=612x612&w=0&h=iOn1afz86ugo6htm-wQcGIfGXRR5xeW9ykRWAL0uaXA=" alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;">
              </a>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end shoplogo -->

    <!-- start hero -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end hero -->

    <!-- start copy block -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with <a href="https://blogdesire.com">Expertis</a>, you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start button -->
          <tr>
            <td align="left" bgcolor="#ffffff">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                          <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Your Email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- end button -->

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
              <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
              <p style="margin: 0;"><a href="${url}" target="_blank">${url}</a></p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start copy -->
          <tr>
            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
              <p style="margin: 0;">Cheers,<br> Expertis</p>
            </td>
          </tr>
          <!-- end copy -->

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end copy block -->

    <!-- start footer -->
    <tr>
      <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

          <!-- start permission -->
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
              <p style="margin: 0;">You received this email because we received a request for verify email for your account. If you didn't request for email verification you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end permission -->

          <!-- start unsubscribe -->
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
              <p style="margin: 0;">To stop receiving these emails, you can <a href="https://sendgrid.com" target="_blank">unsubscribe</a> at any time.</p>
              <!-- <p style="margin: 0;">Paste 1234 S. Broadway St. City, State 12345</p> -->
            </td>
          </tr>
          <!-- end unsubscribe -->

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end footer -->

  </table>
  <!-- end body -->

</body>
</html>
        
        `,
  });
}

async function deleteUser(req,res, callback) {
  //console.log(req.id);
  //console.log("deleteUser");
  const { id } = req.params;
  //console.log(id);
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }
  if (
    !(await isAuthorizedUser(id, req.headers.authorization))
  ) {
    return callback("User not authorized");
  }
  await user.remove();
  return callback(null, {
    status: 200,
    message: "User deleted successfully",
  });
}

module.exports = {
  login,
  register,
  verify,
  updateUser,
  forgetPassword,
  verifyOTP,
  changePassword,
  reset_password,
  deleteUser,
};
