const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const { Services } = require("../models/service.model");
const moment = require("moment");
const { findOneAndUpdate } = require("../models/appointment.model");

function getSlot(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let slot = hours * 2;
  slot = Math.round(slot);
  if (minutes > 30) {
    slot += 1;
  }
  return slot;
}

function getSlots(startTime, endTime) {
  let slots = [];
  let start = getSlot(startTime);
  console.log("start ", start);
  let end = getSlot(endTime);
  console.log("end ", end);
  for (let i = start; i <= end; i++) {
    slots.push(i);
  }
  return slots;
}
async function bookAppointment(params, callback) {
  const { shopId, userId } = params;
  let startTime = new Date(params.startTime);
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

  console.log("shop ", shop);
  console.log("user ", user);

  console.log("services ", shop.services);
  console.log("services ", services);
  console.log("totalPrice ", totalPrice);
  console.log("totalTime ", totalTime);
  console.log("startTime ", startTime);
  console.log(startTime.getHours());
  console.log(startTime.getMinutes());

  let endTime = moment(startTime).add(totalTime, "minutes").toDate();
  console.log("endTime ", endTime);
  console.log(endTime.getHours());
  console.log(endTime.getMinutes());

  let slots = getSlots(startTime, endTime);
  console.log("slots ", slots);

  let bookingDate = startTime.toLocaleDateString();
  console.log("bookingDate ", bookingDate);

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
  console.log(appointment);
  // shop.appointments.push(appointment._id);
  // shop.slotsBooked.push({date:bookingDate,slots:slots})
  // shop.updateOne(

  //   { $push: { appointments: appointment._id } },
  //   {$},
  //   function(err, result) {
  //     if (err) {
  //       res.send(err);
  //     } else {
  //       res.send(result);
  //     }
  //   }
  // );

  user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $push: {
        appointments: appointment._id,
      },
    },
    { new: true, upsert: true }
  ).catch((e) => console.log(e));
  console.log(user);

  shop = await Shop.findOneAndUpdate(
    { _id: shopId, "slotsBooked.date": bookingDate },
    {
      "slotsBooked.date": {date: bookingDate, slots: slots},
      $addToSet: {
        appointments: appointment._id,
      },
    },
    { new: true, upsert: true }
  ).catch((e) => console.log(e));
  console.log(shop);

  //   let slotofshop = await Shop.update({'comments._id': comment_id},
  //   {'$set': {
  //          'comments.$.post': "this is Update comment",
  //  }},
  //       function(err,model) {
  //    if(err){
  //       console.log(err);
  //       return res.send(err);
  //     }
  //     return res.json(model);
  // });

  // Shop.findByIdAndUpdate(shopId,$push,{ useFindAndModify: true })
  // Shop.updateOne
  //   await shop.save()
  //   console.log(shop);
  // }
  return callback(null, { shop });
}

module.exports = {
  bookAppointment,
};
