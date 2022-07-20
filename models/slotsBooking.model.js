const mongoose = require("mongoose");
const { Schema } = mongoose;

// ref https://stackoverflow.com/questions/34742224/make-combination-of-two-fields-unique-in-my-collection
const SlotsBookedSchema = new Schema({
  shopId: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: String,
    required: true,
  },
  slots: [Number],
});

SlotsBookedSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

var SlotBooking = mongoose.model("SlotBooking", SlotsBookedSchema);

module.exports = SlotBooking;
