const express = require("express");
const router = express.Router();
const shopsController = require("../controllers/shop.controller");

router.post("/register",shopsController.register );
router.post("/login",shopsController.register );

module.exports = router