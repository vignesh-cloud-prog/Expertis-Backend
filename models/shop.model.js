const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
const { workingHours } = require("../utils/defaults.js");


const ShopRatingSchema = new Schema({
  avg: {
    type: Number,
    default: 3,
  },
  oneStar: {
    type: Number,
    default: 0,
  },
  twoStar: {
    type: Number,
    default: 0,
  },
  threeStar: {
    type: Number,
    default: 0,
  },
  fourStar: {
    type: Number,
    default: 0,
  },
  fiveStar: {
    type: Number,
    default: 0,
  },
  totalMembers: {
    type: Number,
    default: 0,
  },
});

const ShopMemberSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    required: true,
  },
  pic: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
});

ShopMemberSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ContactSchema = new Schema({
  email: {
    type: String,
    required: false,
  },
  website: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
    unique: [true, "Phone number should be unique"],
    required: [true, "Phone number is required"],
  },
  address: {
    type: String,
    required: false,
  },
  pinCode: {
    type: Number,
    required: false,
    // min: [6, "Minimum 6 digit Pin Code"],
    // max: [6, "Maximum 6 digit Pin Code"],
  },
});
ContactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const WorkingHoursSchema = new Schema({
  isOpen: {
    type: Schema.Types.Boolean,
  },
  openingTime: {
    type: Schema.Types.String,
  },
  closingTime: {
    type: Schema.Types.String,
  },
  breaks: [{
    from: {
      type: Schema.Types.String,
    },
    to: {
      type: Schema.Types.String,
    },
    reason: {
      type: Schema.Types.String,
    },
  }],
});
WorkingHoursSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const WeeklyWorkingHours = new Schema({
  sunday: WorkingHoursSchema,
  monday: WorkingHoursSchema,
  tuesday: WorkingHoursSchema,
  wednesday: WorkingHoursSchema,
  thursday: WorkingHoursSchema,
  friday: WorkingHoursSchema,
  saturday: WorkingHoursSchema,
});

WeeklyWorkingHours.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ShopSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    shopId: {
      type: Schema.Types.String,
      unique: [true, "Shop ID should be unique"],
      required: [true, "Shop ID is required"],
    },
    shopName: {
      type: String,
      required: true,
    },
    shopLogo: {
      type: String,
      required: false,
    },
    contact: ContactSchema,
    workingHours: { type: WeeklyWorkingHours, 
    default: workingHours
     },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Tags",
        },
      ],
      required: false,
    },
    members: [
      {
        type: ShopMemberSchema,
        ref: "user",
      },
    ],
    isVerifiedByAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },

    services: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      required: false,
    },
    appointments: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Appointment",
        },
      ],
    },

    slotsBooked: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "SlotBooking",
        },
      ],
    },
    rating: {
      type: ShopRatingSchema,
      default: {
        avg: 3,
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
        totalMembers: 0,
      },
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reviews",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Just for owner to update the shop status
    isOpen: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  { timestamps: true }
);

ShopSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

/**
 * 1. The userSchema.plugin(uniqueValidator) method won’t let duplicate email id to be stored in the database.
 * 2. The unique: true property in email schema does the internal optimization to enhance the performance.
 */
ShopSchema.plugin(uniqueValidator, { message: "Shop already exist." });

const Shop = mongoose.model("Shop", ShopSchema);
module.exports = Shop;
