const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const SlotsBooked = require("../models/slotsBooking.model");
const { Services } = require("../models/service.model");
const moment = require("moment");
const { getSlots, getSlot } = require("../utils/utils");


async function bookAppointment(params, callback) {
  try{
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
  })
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
  )
  if (!updatedUser) return callback("User not found");

  const slotBooked = await SlotsBooked.findOneAndUpdate(
    { date: bookingDate, shopId: shopId },
    {
      shopId: shopId,
      date: bookingDate,
      $addToSet: { slots: slots },
    },
    { new: true, upsert: true }
  )
  if (!slotBooked) {
    return callback("Slot not booked");
  }
  //console.log(" slotBooked \n", slotBooked);

  const updatedShop = await Shop.findOneAndUpdate(
    { _id: shopId},
    {
      $addToSet: {
        slotsBooked: slotBooked._id,
        appointments: appointment._id,
      },
    },
    { new: true}
  )
  if (!updatedShop) return callback("Shop not found");
  const bookingData= await Appointment.findById(appointment._id).populate("shopId").populate("userId");
  return callback(null, bookingData );
  }catch(error){
    return callback(error);
  }
}

module.exports = {
  bookAppointment,
};