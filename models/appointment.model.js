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
    paymentStatus: {
      type: String,
      // PENDING : payment is not done
      // PARTIAL : payment is done partially
      // FULLY_PAID : payment is done fully
      enum: ["PENDING", "PARTIALLY_PAID", "FULLY_PAID"],
      default: "PENDING",
      required: true,
    },
    appointmentStatus: {
      type: String,
      // PENDING : User has requested the appointment
      // ACCEPTED : Shop has accepted the appointment
      // CONFIRMED : User has confirmed the appointment by payment
      // COMPLETED : Appointment is completed
      // CANCELLED : User has cancelled the appointment
      // REJECTED : Shop has rejected the appointment
      enum: [
        "PENDING",
        "ACCEPTED",
        "CONFIRMED",
        "COMPLETED",
        "CANCELED",
        "REJECTED",
      ],
      default: "PENDING",
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
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);
module.exports = Appointment;
