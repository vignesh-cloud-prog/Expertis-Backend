const express = require("express");
const router = express.Router();
const shopsController = require("../controllers/shop.controller");

router.get("/", shopsController.getShops);
router.post("/shop", shopsController.createShop);
router.post("/shop/view/:id", shopsController.addShopView);
router.get("/shop/services/:id", shopsController.getServices);
router.delete("/shop/services/:id", shopsController.deleteService);
router.get("/shop/slot/:shopId/:memberId/:date", shopsController.getSlot);
router.post("/services", shopsController.addService);
router.patch("/services", shopsController.updateService);
router.get("/shop/:id", shopsController.getShopById);
router.get("/shop/analytics/:id", shopsController.getShopAnalyticsById);
router.get("/shops/:shopId", shopsController.getShopByShopId);
router.patch("/shop/", shopsController.updateShop);
router.delete("/shop/:id", shopsController.deleteShop);

module.exports = router;
