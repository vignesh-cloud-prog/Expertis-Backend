const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const TagSchema = new Schema({
  tagName: {
    type: String,
    required: [true,"tag name is required"],
  },
  tagPic: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  isVerifiedByAdmin: {
    type: String,
    required: false,
    default: false,
  },
  shops: [{
    type: Schema.Types.ObjectId,
    ref: "Shop",
  }],
  services: [{
    type: Schema.Types.ObjectId,
    ref: "Services",
  }],

});
TagSchema.plugin(uniqueValidator, { message: "Tag already exist." });
TagSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Tags = mongoose.model("Tags", TagSchema);
module.exports = Tags;
