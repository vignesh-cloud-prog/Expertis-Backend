const usersController = require("../controllers/user.controller");
const { body } = require("express-validator");
const express = require("express");
const router = express.Router();
const {
  validate,
  userLoginValidationRules,
  userRegisterValidationRules,
} = require("../middleware/validator");

router.post(
  "/register",
  userRegisterValidationRules(),
  validate,
  usersController.register
);
router.post(
  "/login",
  userLoginValidationRules(),
  validate,
  usersController.login
);
router.get("/verify/:token", usersController.verify);
router.post("/update-profile/:id", usersController.updateProfile);
router.get("/user-profile", usersController.userProfile);
router.post("/forget-password", usersController.forgetPassword);
router.post("/verify-otp", usersController.verifyOTP);
router.post("/change-password", usersController.changePassword);
router.post("/reset_password", usersController.reset_password);

module.exports = router;
