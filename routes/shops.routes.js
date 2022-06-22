const express = require("express");
const router = express.Router();
const shopsController = require("../controllers/shop.controller");

router.post("/register", shopsController.register);
router.post("/login", shopsController.login);
router.post("/verify_otp", shopsController.verify_otp);
router.post("/services", shopsController.addService);
router.put("/services", shopsController.updateService);
router.get("/shop/:id", shopsController.getShop);


module.exports = router