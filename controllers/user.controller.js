const bcrypt = require("bcryptjs");
const userServices = require("../services/user.services");
const { uploadUserPic } = require("../middleware/upload.js");

const crypto = require("crypto");
const { isValidVariable } = require("../utils/utils");
const key = process.env.CRYPTO_SECRET_KEY || "forgetSecretKey"; 
const { OAuth2Client } = require("google-auth-library");
const auth = require("../middleware/auth.js");
const User = require("../models/user.model");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * 1. To secure the password, we are using the bcryptjs, It stores the hashed password in the database.
 * 2. In the SignIn API, we are checking whether the assigned and retrieved passwords are the same or not using the bcrypt.compare() method.
 * 3. In the SignIn API, we set the JWT token expiration time. Token will be expired within the defined duration.
 */
exports.updateUser = (req, res, next) => {
  //console.log("updateUser");
  uploadUserPic(req, res, function (err) {
    if (err) {
      next(err);
    } else {
      const {
        id,
        name,
        phone,
        dob,
        gender,
        isShopOwner,
        isShopMember,
        isAdmin,
        address,
        pinCode,
      } = req.body;

      //console.log("Inside update user")
      let picURL = req.file && req.file.cloudinaryUrl ? req.file.cloudinaryUrl : (req.file ? (req.protocol + "://" + req.get("host") + "/" + req.file.path.replace(/\\/g, "/")) : "");

      let model = {
        id: req.body.id,
      };

      if (picURL != "" && picURL !== undefined) {
        model.userPic = picURL;
      }
      if (name != "" && name !== undefined && name !== null) {
        model.name = name;
      }
      if (phone != "" && phone !== undefined && phone !== null) {
        model.phone = phone;
      }
      if (dob != "" && dob !== undefined && dob !== null) {
        model.dob = dob;
      }
      if (gender != "" && gender !== undefined && gender !== null) {
        model.gender = gender;
      }
      if (address != "" && address !== undefined && address !== null) {
        model.address = address;
      }
      if (pinCode != "" && pinCode !== undefined && pinCode !== null) {
        model.pinCode = pinCode;
      }
      let roles = {};

      if (isValidVariable(isShopOwner)) {
        roles.isShopOwner = isShopOwner;
      }
      if (isValidVariable(isShopMember)) {
        roles.isShopMember = isShopMember;
      }
      if (isValidVariable(isAdmin)) {
        roles.isAdmin = isAdmin;
      }
      if (Object.keys(roles).length > 0) {
        model.roles = roles;
      }
      //console.log("model: ", model);

      userServices.updateUser(model, (error, results) => {
        if (error) {
          return next(error);
        }
        return res.status(200).send({
          message: "Success",
          data: results,
        });
      });
    }
  });
};

exports.register = (req, res, next) => {
  const { password } = req.body;
  const salt = bcrypt.genSaltSync(10);

  req.body.password = bcrypt.hashSync(password, salt);
  const host = req.headers.host;

  userServices.register({ ...req.body, host }, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const host = req.headers.host;

  userServices.login({ email, password, host }, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.verifyToken = (req, res, next) => {
  const id= req.user.id;
  userServices.getUser(id, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Authorized User!!",
      data: results,
    });
  }
  );
}


exports.forgetPassword = (req, res, next) => {
  const email = req.body.email;
  userServices.forgetPassword(email, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.verifyOTP = (req, res, next) => {
  const id = req.body.id;
  const otp = req.body.otp;
  const hash = req.body.hash;

  if (!id && !otp && !hash) {
    return res.status(400).send({
      message: "Data is missing",
    });
  }
  userServices.verifyOTP(id, otp, hash, (error, results) => {
    if (error) {
      // //console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.changePassword = (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const hash = req.body.hash;
  const { password } = req.body;

  // Separate Hash value and expires from the hash returned from the user
  let [hashValue, expires] = hash.split(".");
  // Check if expiry time has passed
  let now = Date.now();
  if (now > parseInt(expires)) {
    return res.status(400).send({
      message: "OTP Expired",
    });
  }
  // Calculate new hash with the same key and the same algorithm
  let data = `${email}.${otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("hex");
  console.log("newCalculatedHash: ", newCalculatedHash);
  console.log("hashValue: ", hashValue);
  // Match the hashes
  if (newCalculatedHash === hashValue) {
    // Create new hash with new password
    const salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(password, salt);
    // Update the password in the database
    userServices.changePassword(req.body, (error, results) => {
      if (error) {
        return next(error);
      }
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    });
  } else {
    return res.status(400).send({
      message: "OTP does not match",
    });
  }
};

exports.reset_password = (req, res, next) => {
  const { newPassword } = req.body;

  const salt = bcrypt.genSaltSync(10);

  req.body.newPassword = bcrypt.hashSync(newPassword, salt);
  userServices.reset_password(req.body, (error, results) => {
    if (error) {
      // //console.log(error);
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.deleteUser = (req, res, next) => {
  userServices.deleteUser(req, res, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getAllUser = (req, res, next) => {
  userServices.getAllUser(req, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.getAdminAnalytics = (req, res, next) => {
  userServices.getAdminAnalytics(req, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.addOrRemoveFav = (req, res, next) => {
  userServices.addOrRemoveFavList(req, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

exports.googleAuth = async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken : idToken.trim(),
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: "Invalid Google token payload" });
    }
    console.log("payload: ", payload);  
    const { email, name, sub: googleId, picture, given_name, family_name, email_verified, gender } = payload;
    if (!email || !googleId) {
      return res.status(401).json({ error: "Google token missing required fields" });
    }
    // Map gender to enum
    const genderMap = { male: "MALE", female: "FEMALE", other: "OTHERS", others: "OTHERS" };
    const mappedGender = genderMap[(gender || "").toLowerCase()];
    let user = await User.findOne({ email });
    if (user) {
      // Build update object only with fields that need to be updated
      const updateFields = {};
      if (!user.googleId && googleId) {
        updateFields.googleId = googleId;
      }
      if (!user.userPic && picture) {
        updateFields.userPic = picture;
      }
      // Only set gender if mappedGender is defined and user.gender is not already set
      if ((!user.gender || user.gender === null) && mappedGender) {
        updateFields.gender = mappedGender;
      }
      if (Object.keys(updateFields).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updateFields });
        // Refresh user from DB to get updated fields
        user = await User.findById(user._id);
      }
    } else {
      // Only set fields that are present in the payload
      const userData = {
        email,
        googleId,
        verified: email_verified,
        password: googleId, // Not used, but required by schema
        favoriteShops: [],
        shop: [],
        appointments: [],
      };
      if (name || given_name || family_name) {
        userData.name = name || `${given_name || ""} ${family_name || ""}`.trim() || email;
      }
      if (picture) {
        userData.userPic = picture;
      }
      // Only add gender if mappedGender is defined
      if (mappedGender) {
        userData.gender = mappedGender;
      }
      user = new User(userData);
      await user.save();
    }
    // Issue JWT using same logic as other logins
    const token = auth.generateAccessToken({
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.roles?.isAdmin,
      isShopMember: user.roles?.isShopMember,
      isShopOwner: user.roles?.isShopOwner,
      isVerified: user.verified,
      dob: user.dob,
      phone: user.phone,
      gender: user.gender,
    });
    // Build response data similar to email/password login
    const userObj = user.toObject ? user.toObject() : user;
    res.status(200).send({
      message: "Success",
      data: {
        ...userObj,
        token,
        message: "Login Successful",
      },
    });
  } catch (err) {
    // Log technical error for debugging
    console.error("Google Auth Error:", err);
    let userMessage = "An error occurred during Google authentication.";
    if (err && typeof err.message === "string") {
      if (err.message.includes("Token used too late")) {
        userMessage = "Your Google sign-in link or token has expired. Please try signing in again.";
      } else if (err.message.includes("Token used too early")) {
        userMessage = "Your Google sign-in token is not yet valid. Please try again in a moment.";
      } else if (err.message.includes("Invalid Google token payload")) {
        userMessage = "Google authentication failed. Please try again.";
      } else if (err.message.includes("user validation failed")) {
        userMessage = "There was a problem creating or updating your account. Please contact support if this continues.";
      } else if (err.message.toLowerCase().includes("expired")) {
        userMessage = "Your Google sign-in token has expired. Please try again.";
      } else if (err.message.toLowerCase().includes("invalid")) {
        userMessage = "Invalid Google sign-in token. Please try again.";
      }
    }
    res.status(401).json({ error: userMessage });
  }
};
