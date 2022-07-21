const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const SlotsBooked = require("../models/slotsBooking.model");
const { Services } = require("../models/service.model");
const moment = require("moment");
const { getSlots, getSlot, isAuthorizedUser } = require("../utils/utils");
const ObjectId = require("mongoose").Types.ObjectId;
const nodemailer = require("nodemailer");
const { convertTimeFormate } = require("../utils/convertTime");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function bookAppointment(params, callback) {
  try {
    const { shopId, userId } = params;
    let startTime = new Date(params.startTime);
    if (startTime < new Date()) {
      return callback({
        status: 400,
        message: "Start time should be greater than current time",
      });
    }
    let user = await User.findById(userId);
    let shop = await Shop.findById(shopId);

    if (!shop) return callback("Shop not found");
    if (!user) return callback("User not found");
    servicesIds = params.services;

    let services = [];
    let totalPrice = 0;
    let totalTime = 0;
    for (let i = 0; i < servicesIds.length; i++) {
      if (shop.services.includes(servicesIds[i])) {
        const service = await Services.findById(servicesIds[i]);
        if (!service) return callback("Service not found");
        totalPrice += parseFloat(service.price);
        totalTime += parseInt(service.time);
        services.push(service);
      } else {
        return callback("Service not found in shop with id: " + servicesIds[i]);
      }
    }

    //console.log("shop ", shop);
    //console.log("user ", user);

    //console.log("services ", shop.services);
    //console.log("services ", services);
    //console.log("totalPrice ", totalPrice);
    //console.log("totalTime ", totalTime);
    //console.log("startTime ", startTime);
    //console.log(startTime.getHours());
    //console.log(startTime.getMinutes());

    let endTime = moment(startTime).add(totalTime, "minutes").toDate();
    //console.log("endTime ", endTime);
    //console.log(endTime.getHours());
    //console.log(endTime.getMinutes());

    let slots = getSlots(startTime, endTime);
    if (slots.length === 0) {
      return callback("Slots time is not available today");
    }
    //console.log("slots ", slots);

    let bookingDate = startTime.toLocaleDateString();
    ////console.log("bookingDate ", bookingDate);

    const preBookedSlots = await SlotsBooked.find({
      shopId: shopId,
      date: bookingDate,
      slots: { $in: slots },
    });
    // console.log("preBookedSlots ", preBookedSlots);
    if (preBookedSlots.length > 0) {
      return callback("Slots are already booked");
    }

    const appointment = await Appointment.create({
      shopId: shopId,
      userId: userId,
      totalPrice: totalPrice,
      totalTime: totalTime,
      services: services,
      slots: slots,
      startTime: startTime,
      endTime: endTime,
    });
    if (!appointment) return callback("Appointment not created");

    //console.log(appointment);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          appointments: appointment._id,
        },
      },
      { new: true, upsert: true }
    );
    if (!updatedUser) return callback("User not found");

    const slotBooked = await SlotsBooked.findOneAndUpdate(
      { date: bookingDate, shopId: shopId },
      {
        shopId: shopId,
        date: bookingDate,
        $addToSet: { slots: slots },
      },
      { new: true, upsert: true }
    );
    if (!slotBooked) {
      return callback("Slot not booked");
    }
    //console.log(" slotBooked \n", slotBooked);

    const updatedShop = await Shop.findOneAndUpdate(
      { _id: shopId },
      {
        $addToSet: {
          slotsBooked: slotBooked._id,
          appointments: appointment._id,
        },
      },
      { new: true }
    );
    if (!updatedShop) return callback("Shop not found");
    const bookingData = await Appointment.findById(appointment._id)
      .populate("shopId")
      .populate("userId");
    return callback(null, bookingData);
  } catch (error) {
    return callback(error);
  }
}

async function getUserAppointments(req, res, callback) {
  try {
    const { id } = req.params;
    let appointmentStatus = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
      "REJECTED",
    ];
    let filter = {
      userId: id,
      appointmentStatus: { $in: appointmentStatus },
    };
    if (!ObjectId.isValid(id)) {
      return callback({
        status: 400,
        message: "Invalid user id",
      });
    }

    console.log("userId ", id);
    if (!(await isAuthorizedUser(id, req.headers.authorization))) {
      return callback({
        status: 401,
        message: "Unauthorized",
      });
    }

    const appointments = await Appointment.find(filter)
      .populate("shopId")
      .populate("userId");
    return callback(null, appointments);
  } catch (error) {
    return callback(error);
  }
}

async function getShopAppointments(req, res, callback) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return callback({
        status: 400,
        message: "Invalid shop id",
      });
    }

    if (!(await isAuthorizedUser(id, req.headers.authorization))) {
      return callback({
        status: 401,
        message: "Unauthorized",
      });
    }

    const appointments = await Appointment.find({ shopId: id })
      .populate("shopId")
      .populate("userId");
    return callback(null, appointments);
  } catch (error) {
    return callback(error);
  }
}

async function getAppointment(req, callback) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return callback({
        status: 400,
        message: "Invalid appointment id",
      });
    }
    console.log("appointmentId ", id);
    const appointment = await Appointment.findById(id)
      .populate("shopId")
      .populate("userId");
    if (!appointment) return callback("Appointment not found");
    return callback(null, appointment);
  } catch (error) {
    return callback(error);
  }
}

async function cancelAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    console.log("appointmentId ", id);
    const appointment = await Appointment.findById(id);
    console.log("appointment ", appointment);
    if (!appointment) return callback("Appointment not found");

    console.log(
      "access ",
      Boolean(
        await isAuthorizedUser(appointment.userId, req.headers.authorization)
      )
    );
    if (
      !(await isAuthorizedUser(appointment.userId, req.headers.authorization))
    ) {
      return callback("User not authorized");
    }

    const updateSlotsBooked = await SlotsBooked.findOneAndUpdate(
      {
        date: appointment.startTime.toLocaleDateString(),
        shopId: appointment.shopId,
      },
      {
        $pullAll: {
          slots: appointment.slots,
        },
      },
      { new: true }
    );
    console.log("updateSlotsBooked ", updateSlotsBooked);
    if (!updateSlotsBooked) return callback("Slots not found");

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "CANCELLED",
      },
      { new: true }
    );
    if (!updatedAppointment) return callback("Operation failed");
    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

async function rejectAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    console.log("appointmentId ", id);
    const appointment = await Appointment.findById(id);
    console.log("appointment ", appointment);
    if (!appointment) return callback("Appointment not found");

    if (
      !(await isAuthorizedUser(appointment.shopId, req.headers.authorization))
    ) {
      return callback("User not authorized");
    }

    const updateSlotsBooked = await SlotsBooked.findOneAndUpdate(
      {
        date: appointment.startTime.toLocaleDateString(),
        shopId: appointment.shopId,
      },
      {
        $pullAll: {
          slots: appointment.slots,
        },
      },
      { new: true }
    );
    console.log("updateSlotsBooked ", updateSlotsBooked);

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "REJECTED",
      },
      { new: true }
    );
    if (!updatedAppointment) return callback("Operation failed");
    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

async function acceptAppointment(req, res, callback) {
  console.log("")
  try {
    const { id } = req.params;
    console.log("appointmentId ", id);
    const appointment = await Appointment.findById(id);
    const user = await User.findById(id);
    console.log("appointment ", appointment);
    if (!appointment) return callback("Appointment not found");

    if (
      !(await isAuthorizedUser(appointment.ownerId, req.headers.authorization))
    ) {
      return callback("User not authorized");
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "ACCEPTED",
      },
      { new: true }
    )
    if (!updatedAppointment) return callback("Operation failed");


    const { email } = user;
    const { startTime, endTime } = updatedAppointment;
    startTime = convertTimeFormate(startTime);
    endTime = convertTimeFormate(endTime);
    let calLink = `href="http://www.google.com/calendar/event?action=TEMPLATE&text=Appointment%20Time&dates=${startTime}/${endTime}&details=Event%20Details%20Here&location=ryuy ghh`
    await transporter
      .sendMail({
        to: email,
        subject: "Your appointment confiromation ",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Expertis Inc</a>
          </div>
          <p style="font-size:1.1em">Your appointment is confirmed,</p>
          <p>Thank you for choosing Expertis. your appointment is confirm by the shop time is</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${startTime} To ${endTime}</h2>
          <a href="${calLink}">Add to calender</a>
          <p style="font-size:0.9em;">Regards,<br />Expertis</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Expertis Inc</p>
            <p>Find your best</p>
            <p>India</p>
          </div>
        </div>
      </div>`,
      })



    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

async function completeAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    console.log("appointmentId ", id);
    const appointment = await Appointment.findById(id);
    console.log("appointment ", appointment);
    if (!appointment) return callback("Appointment not found");

    if (
      !(await isAuthorizedUser(appointment.userId, req.headers.authorization))
    ) {
      return callback("User not authorized");
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "COMPLETED",
      },
      { new: true }
    );
    if (!updatedAppointment) return callback("Operation failed");
    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

module.exports = {
  bookAppointment,
  getUserAppointments,
  getShopAppointments,
  acceptAppointment,
  cancelAppointment,
  rejectAppointment,
  completeAppointment,
  getAppointment,
};
