const mongoose = require("mongoose");
const { Schema } = mongoose;

// ref https://stackoverflow.com/questions/34742224/make-combination-of-two-fields-unique-in-my-collection
const SlotsBookedSchema = new Schema({
    shopId:{
        type:Schema.Types.ObjectId,
        ref:"Shop"
    },
    date: {
      type: String,
      unique: true,
      required: true,
    },
    slots: [Number],
  });

var slotBooking = mongoose.model("SlotBooking", SlotsBookedSchema );

module.exports=slotBooking;