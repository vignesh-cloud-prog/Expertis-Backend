const usersController = require("../controllers/user.controller");

const express = require("express");
const router = express.Router();

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/verify/:token", usersController.verify);
router.post("/update-Profile/:id", usersController.updateProfile);
router.get("/user-Profile", usersController.userProfile);

module.exports = router;
