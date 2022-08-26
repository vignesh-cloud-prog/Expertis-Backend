const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const SlotsBooked = require("../models/slotsBooking.model");
const { Services } = require("../models/service.model");
const moment = require("moment");
const { getSlots, getDDMMMYYYYDate } = require("../utils/utils");
const ObjectId = require("mongoose").Types.ObjectId;
const nodemailer = require("nodemailer");
// const { convertTimeFormate, tCovertToDisplay } = require("../utils/convertTime");
let { convertTimeFormate, tCovertToDisplay } = require("../utils/converTime");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});


async function bookAppointment(params, callback) {

  try {
    const { shopId, userId, memberId } = params;
    let startTime = new Date(params.startTime);
    console.log(startTime.getHours()
    );
    console.log(startTime, "book appointment");
    if (startTime < new Date()) {
      return callback({
        status: 400,
        message: "Start time should be greater than current time",
      });
    }
    // let member = await User.findById(memberId);
    let user = await User.findById(userId);
    let shop = await Shop.findById(shopId);

    if (!shop) return callback("Shop not found");
    if (!user) return callback("User not found");

    // console.log("members", shop.members);
    let memberFound = false;
    shop.members.forEach((member) => {
      if (member.member.toString() == memberId) {
        memberFound = true;
        console.log(`member found ${memberId}`);
      }
    }
    );
    if (!memberFound) return callback("Member not found hoi");


    servicesIds = params.services;

    let services = [];
    let totalPrice = 0;
    let totalTime = 0;
    let serviceData = [];
    for (let i = 0; i < servicesIds.length; i++) {
      if (shop.services.includes(servicesIds[i])) {
        const service = await Services.findById(servicesIds[i]);
        if (!service) return callback("Service not found");
        totalPrice += parseFloat(service.price);
        totalTime += parseInt(service.time);
        data = { name: service.serviceName, price: parseFloat(service.price), time: parseInt(service.time) }
        serviceData.push(data)
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

    let bookingDate = getDDMMMYYYYDate(startTime);
    ////console.log("bookingDate ", bookingDate);

    const preBookedSlots = await SlotsBooked.find({
      shopId: shopId,
      memberId: memberId,
      date: bookingDate,
      slots: { $in: slots },
    });
    // //console.log("preBookedSlots ", preBookedSlots);
    if (preBookedSlots.length > 0) {
      return callback("Slots are already booked");
    }

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
        memberId: memberId,
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
    let { contact } = updatedShop
    startTime = convertTimeFormate(startTime)
    endTime = convertTimeFormate(endTime)
    startTime = tCovertToDisplay(startTime)
    endTime = tCovertToDisplay(endTime)
    // console.log(bookingData, "names")
    // const service = await Services.findById(params.services);
    let tabledata = ""
    bookingData.services.map((ele) => {
      tabledata += `
<tr>
<td style="border: 1px solid black;
border-collapse: collapse;">${ele.serviceName}</td>
<td style="border: 1px solid black;
border-collapse: collapse;">${ele.price}</td>
<td style="border: 1px solid black;
border-collapse: collapse;">${ele.time}</td>
</tr >
`          })
    console.log(contact.email, "email")
    await transporter
      .sendMail({
        to: contact.email,
        subject: "New appointment",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Expertis Inc</a>
          </div>
          <p style="font-size:1.1em">You have new appointment request, </p>
          <p>Thank you for choosing Expertis. You have new appointment request for </p>
          <br>
          <table style="border: 1px solid black;
          border-collapse: collapse;width="100%"">
          <tr>
            <th style="border: 1px solid black;
            border-collapse: collapse;">Name</th>
            <th style="border: 1px solid black;
            border-collapse: collapse;">Price</th>
            <th style="border: 1px solid black;
            border-collapse: collapse;">Time</th>
          </tr>
          ${tabledata}
          </table>
          ${startTime} To ${endTime} <br>
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
    console.log("mail sent to ", contact.email)
    return callback(null, bookingData);
  } catch (error) {
    console.log(error, "error")
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
    const { userId, shopId } = appointment;
    const shopdata = await Shop.findById(shopId);
    const userdata = await User.findById(userId);
    let { email } = userdata;
    let { contact } = shopdata;
    let { startTime, endTime } = updatedAppointment;
    console.log(String(startTime), endTime);
    startTime = convertTimeFormate(startTime);
    endTime = convertTimeFormate(endTime);
    console.log(startTime, endTime, "after convert");
    let address = contact.address.split(' ')
    adress = address.join('%20')

    let calLink = `http://www.google.com/calendar/event?action=TEMPLATE&text=Appointment%20Time&dates=${startTime}/${endTime}&details=Event%20Details%20Here&location=${address}+${contact.pinCode}`
    startTime = tCovertToDisplay(startTime);
    // endTime = tCovertToDisplay(endTime);
    // console.log(email, "email")
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
          <p>Thank you for choosing Expertis. your appointment is confirm by the shop at</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${startTime}</h2>
          <br>
          <h3 style="background: #00166a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;"><a href="${calLink}">Add to calender</a></h3>
          
          <p style="font-size:0.9em;">Regards,<br />Expertis</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Expertis Inc</p>
            <p>Find your best</p>
            <p>India</p>
          </div>
        </div>
      </div>`,
      }
      )
    console.log("mail sent to user for conformation", calLink);
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
