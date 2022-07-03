const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

router.post("/book", appointmentController.bookAppointment);
router.patch("/cancel/:id", appointmentController.cancelAppointment);
router.patch("/accept/:id", appointmentController.acceptAppointment);
router.patch("/reject/:id", appointmentController.rejectAppointment);
router.patch("/complete/:id", appointmentController.completeAppointment);
router.get("/user/:id", appointmentController.getUserAppointments);
router.get("/shop/:id", appointmentController.getShopAppointments);
router.get("/:id", appointmentController.getAppointment);

module.exports = router;
