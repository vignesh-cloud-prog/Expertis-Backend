const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const SlotsBooked = require("../models/slotsBooking.model");
const { Services } = require("../models/service.model");
const moment = require("moment");
const { getSlots, getDDMMMYYYYDate } = require("../utils/utils");
const ObjectId = require("mongoose").Types.ObjectId;

async function bookAppointment(params, callback) {
  try {
    const { shopId, userId, memberId } = params;
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

    let memberFound = false;
    // check if member is present in the shop
    shop.members.forEach((member) => {
      if (member.member.toString() == memberId) {
        memberFound = true;
        console.log(`member found ${memberId}`);
      }
    });
    if (!memberFound) return callback("Member not found");

    servicesIds = params.services;
    let services = [];
    let totalPrice = 0;
    let totalTime = 0;
    // Calculate total price and total time for the services
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
    // Calculate end time for the appointment by adding total time to start time
    let endTime = moment(startTime).add(totalTime, "minutes").toDate();
    // Get the slots between start time and end time
    let slots = getSlots(startTime, endTime);
    if (slots.length === 0) {
      return callback("Slots time is not available today");
    }
    // Covert start time to DD-MMM-YYYY format
    let bookingDate = getDDMMMYYYYDate(startTime);
    // Check if slots are already booked for the date
    const preBookedSlots = await SlotsBooked.find({
      shopId: shopId,
      memberId: memberId,
      date: bookingDate,
      slots: { $in: slots },
    });
    if (preBookedSlots.length > 0) {
      return callback("Slots are already booked");
    }
    // Create appointment object
    const appointment = await Appointment.create({
      shopId: shopId,
      userId: userId,
      memberId: memberId,
      totalPrice: totalPrice,
      totalTime: totalTime,
      services: services,
      slots: slots,
      startTime: startTime,
      endTime: endTime,
    });
    if (!appointment) return callback("Appointment not created");
    // Add appointment to user appointments
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
    // Create or update slots booked for the date, shop and member
    const slotBooked = await SlotsBooked.findOneAndUpdate(
      { date: bookingDate, shopId: shopId },
      {
        shopId: shopId,
        memberId: memberId,
        date: bookingDate,
        $addToSet: { slots: slots },
      },
      { new: true, upsert: true }
    );
    if (!slotBooked) {
      return callback("Slot not booked");
    }
    // Add appointment and slots booked to shop appointments
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
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
    return callback(null, bookingData);
  } catch (error) {
    return callback(error);
  }
}

async function getUserAppointments(req, res, callback) {
  try {
    const { id } = req.params;
    const { past } = req.query;
    let appointmentStatus = [
      "PENDING",
      "ACCEPTED",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
      "REJECTED",
    ];
    let filter = {
      userId: id,
      appointmentStatus: { $in: appointmentStatus },
      endTime: { $gt: new Date() },
    };
    // if past is true then get past appointments
    if (past !== undefined && past == "true") {
      filter.endTime = { $lt: new Date() };
    }
    if (!ObjectId.isValid(id)) {
      return callback({
        status: 400,
        message: "Invalid user id",
      });
    }
    // Check is user authorized to get appointments
    if (id != req.user.id && req.user.isAdmin == false) {
      return callback({
        status: 401,
        message: "Unauthorized",
      });
    }
    const appointments = await Appointment.find(filter)
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
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
    let filter = {
      shopId: id,
    };
    const { upcoming } = req.query;
    // if upcoming is true then only upcoming appointments are returned with the following appointment status
    let appointmentStatus = ["PENDING", "CONFIRMED", "ACCEPTED"];
    if (upcoming !== undefined && upcoming == "true") {
      filter.endTime = { $gt: new Date() };
      filter.appointmentStatus = { $in: appointmentStatus };
    }
    const appointments = await Appointment.find(filter)
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
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
    const appointment = await Appointment.findById(id)
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
    if (!appointment) return callback("Appointment not found");
    return callback(null, appointment);
  } catch (error) {
    return callback(error);
  }
}

async function cancelAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return callback("Appointment not found");
    if (appointment.appointmentStatus == "COMPLETED") {
      return callback("Appointment is already completed");
    }
    if (appointment.appointmentStatus == "CANCELLED") {
      return callback("Appointment is already cancelled");
    }
    // Check if user is authorized to cancel appointment
    if (
      req.user.id !== appointment.userId.toString() &&
      req.user.isAdmin == false
    ) {
      return callback("User not authorized");
    }
    // Remove booked slots from slots booked collection
    const updateSlotsBooked = await SlotsBooked.findOneAndUpdate(
      {
        date: getDDMMMYYYYDate(appointment.startTime),
        shopId: appointment.shopId,
        memberId: appointment.memberId,
      },
      {
        $pullAll: {
          slots: appointment.slots,
        },
      },
      { new: true }
    );
    if (!updateSlotsBooked) return callback("Slots not found");
    // Update appointment status to cancelled
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "CANCELLED",
      },
      { new: true }
    )
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
    if (!updatedAppointment) return callback("Operation failed");
    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

async function rejectAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) return callback("Appointment not found");
    // check if user is authorized to reject the appointment
    if (
      appointment.memberId.toString() !== req.user.id &&
      req.user.isAdmin == false
    ) {
      return callback("User not authorized");
    }
    // Remover the appointment from slots booked
    const updateSlotsBooked = await SlotsBooked.findOneAndUpdate(
      {
        date: getDDMMMYYYYDate(appointment.startTime),
        shopId: appointment.shopId,
        memberId: appointment.memberId,
      },
      {
        $pullAll: {
          slots: appointment.slots,
        },
      },
      { new: true }
    );

    // Update the appointment status to rejected
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "REJECTED",
      },
      { new: true }
    )
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
    if (!updatedAppointment) return callback("Operation failed");
    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

async function acceptAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return callback("Appointment not found");
    // check if user is authorized to accept the appointment
    if (
      appointment.memberId.toString() !== req.user.id &&
      req.user.isAdmin == false
    ) {
      return callback("User not authorized");
    }
    // Update the appointment status to accepted
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "ACCEPTED",
      },
      { new: true }
    )
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
    if (!updatedAppointment) return callback("Operation failed");
    return callback(null, updatedAppointment);
  } catch (error) {
    return callback(error);
  }
}

async function completeAppointment(req, res, callback) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return callback("Appointment not found");
    if (appointment.appointmentStatus == "COMPLETED") {
      return callback("Appointment is already completed");
    }
    if (appointment.appointmentStatus == "CANCELLED") {
      return callback("Appointment is already cancelled");
    }
    // check if user is authorized to complete the appointment
    if (
      req.user.id !== appointment.userId.toString() &&
      req.user.isAdmin == false
    ) {
      return callback("User not authorized");
    }
    // Update the appointment status to completed
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      { _id: id },
      {
        appointmentStatus: "COMPLETED",
      },
      { new: true }
    )
      .populate("shopId", "owner shopId shopName shopLogo contact members")
      .populate("userId", "name gender roles userPic favoriteShops address");
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
