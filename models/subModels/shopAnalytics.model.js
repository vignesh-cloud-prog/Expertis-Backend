const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const ViewSchema = require("./view.model");

const ShopAnalyticsSchema = new Schema({
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  views: {
    type: [ViewSchema],
  },
  totalAppointments: {
    type: Number,
    default: 0,
  },
  appointments: {
    type: {
      pending: {
        type: Number,
        default: 0,
      },
      confirmed: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
      cancelled: {
        type: Number,
        default: 0,
      },
      rejected: {
        type: Number,
        default: 0,
      },
      accepted: {
        type: Number,
        default: 0,
      },
    },
    default: {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
      accepted: 0,
    },
  },
});
ShopAnalyticsSchema.plugin(uniqueValidator, { message: "Shop already exist." });
ShopAnalyticsSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ShopAnalytics = mongoose.model("ShopAnalytics", ShopAnalyticsSchema);
module.exports = ShopAnalytics;
