const express = require("express");
const router = express.Router();
const shopsController = require("../controllers/shop.controller");

router.get("/", shopsController.getShops);
router.post("/shop", shopsController.createShop);
router.get("/shop/slot/:shopId/:memberId/:date", shopsController.getSlot);
router.post("/services", shopsController.addService);
router.put("/services", shopsController.updateService);
router.get("/shop/:id", shopsController.getShop);
router.put("/shop/:id", shopsController.updateShop);
router.delete("/shop/:id", shopsController.deleteShop);

module.exports = router;
