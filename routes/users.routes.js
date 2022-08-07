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
router.post("/verify-otp", usersController.verifyOTP);
router.patch("/update", usersController.updateUser);

router.post(
  "/login",
  userLoginValidationRules(),
  validate,
  usersController.login
);
router.get("/verify-token", usersController.verifyToken);
router.post("/forget-password", usersController.forgetPassword);
router.post("/change-password", usersController.changePassword);
router.post("/reset-password", usersController.reset_password);
router.post("/delete/:id", usersController.deleteUser);
router.get("/allUser", usersController.getAllUser);
router.get("/admin/analytics", usersController.getAdminAnalytics);
// router.get("/verify/:token", usersController.verify);

module.exports = router;
