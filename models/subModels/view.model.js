const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const ViewSchema = new Schema({
    from : {
        type: Schema.Types.ObjectId,
        ref: "user",
    },  
},
{ timestamps: true });
ViewSchema.plugin(uniqueValidator, { message: "Tag already exist." });
ViewSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = ViewSchema;

