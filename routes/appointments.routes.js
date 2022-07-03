const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

router.post("/book", appointmentController.bookAppointment);
router.post("/cancel/:id", appointmentController.cancelAppointment);
router.get("/user/:id", appointmentController.getUserAppointments);
router.get("/shop/:id", appointmentController.getShopAppointments);
router.get("/:id", appointmentController.getAppointment);

module.exports = router;
