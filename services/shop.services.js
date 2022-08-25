const Shop = require("../models/shop.model");
const ShopAnalytics = require("../models/subModels/shopAnalytics.model");
const User = require("../models/user.model");
const Reviews = require("../models/review.model");
const Appointments = require("../models/appointment.model");
const auth = require("../middleware/auth.js");
const Tags = require("../models/tags.model");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Services } = require("../models/service.model");
const SlotBooking = require("../models/slotsBooking.model");
const { query } = require("express");
var ObjectId = require("mongoose").Types.ObjectId;

async function createShop(req, shopData, callback) {
  try {
    const { owner } = shopData;
    const { email, phone } = shopData.contact;
    console.log(email, phone);
    const user = await User.findById(owner).exec();
    if (user == null) {
      return callback({
        status: 400,
        message: "Invalid User",
      });
    }
    // Set the shop owner as a member of the shop
    member = {
      member: user._id,
      role: "owner",
      name: user.name,
      pic: user.userPic,
    };
    shopData.members = [member];
    console.log(shopData);
    // Create the shop and save it in the database
    const shop = new Shop(shopData);
    shop
      .save()
      .then((response) => {
        // Add the shop to the user's shop list and update his role to be a shop owner
        User.findByIdAndUpdate(
          owner,
          {
            $set: {
              "roles.isShopOwner": true,
              "roles.isShopMember": true,
            },
            $push: {
              shop: response._id,
            },
          },
          { new: true }
        )
          .then( async (res) => {
            if (res == null) {
              return callback("Document not found");
            } else {
            await  ShopAnalytics.create({
                shop: shop._id,
                views: {
                  from: req.user.id,
                },
              })
              return callback(null, response);
            }
          })
          .catch((err) => {
            return callback(err);
          });
      })
      .catch((error) => {
        if ("contact.phone" in error.errors) {
          return callback({
            status: 400,
            message: "Shop with phone number already exists",
          });
        }
        if ("shopId" in error.errors) {
          return callback({
            status: 400,
            message: "Shop id already in use",
          });
        }
        return callback(error);
      });
  } catch (error) {
    return callback(error);
  }
}

async function updateShop(shopData, callback) {
  const shopId = shopData.id;
  Shop.findByIdAndUpdate(shopId, shopData, {
    useFindAndModify: false,
    new: true,
  })
    .populate("services")
    .then((response) => {
      if (!response)
        callback(
          `Cannot update Shop with id=${shopId}. Maybe Shop was not found!`
        );
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function addService(params, callback) {
  const { id } = params;
  // Creating the service and saving it in the database
  Services.create({ ...params.service_data, shop: id })
    .then(async(document) => {
      // Add the service to the shop's services list
     let updatedShop= await Shop.findByIdAndUpdate(
        id,
        {
          $push: {
            services: document._id,
          },
        },
        { new: true }
      )
      console.log("updated shop", updatedShop);
      return callback(null, document);
    })
    .catch((e) => {
      return callback(e);
    });
}

async function updateService(params, callback) {
  const { id } = params;
  Services.findByIdAndUpdate(id, params.service_data, {
    useFindAndModify: true,
    new: true,
  })
    .then((response) => {
      if (!response)
        callback(
          `Cannot update service with id=${id}. Maybe service was not found!`
        );
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function deleteService(id, callback) {
  Services.findByIdAndRemove(id)
    .then(async (response) => {
      if (!response)
        callback(
          `Cannot delete Service with id=${id}. Maybe Service was not found!`
        );
      else {
        // delete the service from the shop's services list
        let updatedShop = await Shop.findByIdAndUpdate(
          response.shop,
          {
            $pull: { services: id },
          },
          { new: true }
        );
        console.log(updatedShop);

        callback(null, updatedShop);
      }
    })
    .catch((error) => {
      return callback(error);
    });
}

async function deleteShop(req, callback) {
  try {
    const id = req.params.id;
    let shop = await Shop.findById(id).exec();
    if (!shop) {
      return callback({
        status: 400,
        message: "Shop id does not exits",
      });
    }
    // Check is user is authorized to delete the shop
    if (req.user.id != shop.owner) {
      if (!req.user.isAdmin)
        return callback({
          status: 401,
          message: `You are not authorized to delete this shop`,
        });
    }
    //delete the shop services
    await Services.deleteMany({ shop: id });
    //delete the shop reviews
    await Reviews.deleteMany({ to: id });
    //delete the shop appointments
    await Appointments.deleteMany({ shopId: id });
    //delete the shop SlotBooking
    await SlotBooking.deleteMany({ shopId: id });
    //delete the shop
    Shop.findByIdAndRemove(id)
      .then(async (response) => {
        if (!response)
          return callback(
            `Cannot delete Shop with id=${id}. Maybe Shop was not found!`
          );
        // delete shop from user's shops list
        let updatedUser = await User.findByIdAndUpdate(shop.owner, {
          $pull: { shop: id },
        });
        return callback(null, updatedUser);
      })
      .catch((error) => {
        return callback(error);
      });
  } catch (error) {
    return callback(error);
  }
}
async function getShops(req, callback) {
  try {
    // Create query object to hold search criteria
    let query;
    const pinCode = req.query.pinCode;
    let city = req.query.city;
    let gender = req.query.gender;
    let pattern = [];
    if (pinCode !== undefined && pinCode !== null) {
      pattern.push({ "contact.pinCode": pinCode });
    }
    if (gender !== undefined && gender !== null) {
      if (gender.toLowerCase() == "male")
        pattern.push({ gender: { $ne: "WOMEN" } });
      else if (gender.toLowerCase() == "female")
        pattern.push({ gender: { $ne: "MEN" } });
    }

    if (city !== undefined && city !== null) {
      city = new RegExp(city, "i");
      pattern.push({ "contact.address": city });
    }

    if (pattern.length > 0) {
      query = { $or: pattern };
    }
    // Find shops with the given query and sort by rating
    const shops = await Shop.find(query)
      .sort({ "rating.totalMembers": -1, "rating.avg": -1 })
      .limit(10)
      .populate("services");
    // let options = {
    //   page: req.query.page || 1,
    //   limit: req.query.limit || 10,
    // };

    // await Shop.paginate(query, options).then((results) => {
    //   return callback(null, results);
    // })
    return callback(null, shops);
  } catch (e) {
    return callback(e);
  }
}

async function getShopByShopId(shopId, callback) {
  // Find shop by either shopId or objectId
  let pattern = [];
  let query;
  if (shopId !== undefined && shopId !== null) {
    pattern.push({ shopId: shopId });
  }
  if (ObjectId.isValid(shopId)) {
    pattern.push({ _id: ObjectId(shopId) });
  }
  if (pattern.length > 0) {
    query = { $or: pattern };
  }
  Shop.findOne(query)
    .populate("services")
    .then((response) => {
      if (!response) callback("Shop not found with id " + shopId);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function addShopView(req, callback) {
  ShopAnalytics.findOneAndUpdate(
    { shop: req.params.id },
    {
      $push: {
        views: {
          from: req.user.id,
        },
      },
    },
    { new: true }
  )

    .then((response) => {
      if (!response) {
        ShopAnalytics.create({
          shop: req.params.id,
          views: {
            from: req.user.id,
          },
        })
          .then(async (response) => {
            let updatedShop = await Shop.findByIdAndUpdate(req.params.id, {
              analytics: response._id,
            });
            console.log(updatedShop);
            callback(null, response);
          })
          .catch((error) => {
            return callback(error);
          });
      } else {
        callback(null, response);
      }
    })
    .catch((error) => {
      return callback(error);
    });
}

async function getShopAnalyticsById(req, callback) {
  ShopAnalytics.findOne({ shop: req.params.id })
    .then((response) => {
      if (!response) callback("Not found Shop with id " + req.params.id);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function getShopById(shopId, callback) {
  console.log(shopId);
  Shop.findById(shopId)
    .populate("services")
    .then((response) => {
      if (!response) callback("Not found Shop with id " + shopId);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}


function getSlot(query, callback) {
  SlotBooking.findOne(query)
    .then((response) => {
      if (!response) callback(null, []);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}

async function getServices(id, callback) {
  try {
    let shop = await Shop.findById(id).populate("services");
    console.log(shop);
    if (!shop) return callback({ message: "Shop not found", status: 404 });

    return callback(null, shop.services);
  } catch (e) {
    return callback(e);
  }
}

async function getAllShopsWithPagination(req, callback) {
  try {
    // Create query object to hold search criteria
    let query;
    const pinCode = req.query.pinCode;
    let city = req.query.city;
    let gender = req.query.gender;
    let pattern = [];
    if (pinCode !== undefined && pinCode !== null) {
      pattern.push({ "contact.pinCode": pinCode });
    }
    if (gender !== undefined && gender !== null) {
      if (gender.toLowerCase() == "male")
        pattern.push({ gender: { $ne: "WOMEN" } });
      else if (gender.toLowerCase() == "female")
        pattern.push({ gender: { $ne: "MEN" } });
    }

    if (city !== undefined && city !== null) {
      city = new RegExp(city, "i");
      pattern.push({ "contact.address": city });
    }

    if (pattern.length > 0) {
      query = { $or: pattern };
    }
    // Find shops with the given query and sort by rating
    // const shops = await Shop.find(query)
    // .sort({ "rating.totalMembers": -1, "rating.avg": -1 })
    // .limit(10)
    // .populate("services");
    let options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: { "rating.totalMembers": -1, "rating.avg": -1 }
    };

    await Shop.paginate(query, options).then((results) => {
      return callback(null, results);
    })
    // return callback(null,shops);
  } catch (e) {
    return callback(e);
  }
}

module.exports = {
  createShop,
  updateservice: updateService,
  addShopView,
  getShopAnalyticsById,
  addservice: addService,
  deleteService,
  getShopById,
  getShopByShopId,
  updateShop,
  deleteShop,
  getShops,
  getSlot,
  getServices,
  getAllShopsWithPagination,
};
