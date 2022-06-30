const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ServiceSchema } = require("./service.model");

const AppointmentSchema = new Schema(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalTime: {
      type: Number,
      required: false,
    },
    isAccepted: {
      type: Boolean,
      required: false,
      default: false,
    },
    isPaid: {
      type: Boolean,
      required: false,
      default: false,
    },
    isProcessed: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCanceled: {
      type: Boolean,
      required: false,
      default: false,
    },
    services: {
      type: [
        {
          type: ServiceSchema,
        },
      ],
      required: false,
    },
    slots: {
      type: [Number],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);
module.exports = Appointment;
