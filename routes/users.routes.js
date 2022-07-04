const usersController = require("../controllers/user.controller");
const { body } = require("express-validator");
const express = require("express");
const router = express.Router();
const {validate, userValidationRules} = require("../middleware/validator");

router.post(
  "/register",

  body("email").isEmail().withMessage("Email must be valid"),
  body("name").not().isEmpty().trim().escape().isLength({ min: 3, max: 20 }),
  body("phone").isLength({ min: 10, max: 10 }).isMobilePhone(),
  // password must be at least 5 chars long
  body("password").isLength({ min: 5 }),
  usersController.register
);
router.post("/login",userValidationRules(), validate, usersController.login);
router.get("/verify/:token", usersController.verify);
router.post("/update-Profile/:id", usersController.updateProfile);
router.get("/user-Profile", usersController.userProfile);
router.post("/send_otp", usersController.send_otp);
router.post("/verify_otp", usersController.verify_otp);
router.post("/new_password", usersController.new_password);
router.post("/reset_password", usersController.reset_password);

module.exports = router;
