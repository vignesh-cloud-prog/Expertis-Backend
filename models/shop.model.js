const mongoose = require("mongoose");
const { Schema } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
const { stringify } = require("nodemon/lib/utils");

const ServiceSchema = new Schema(
    {

        serviceName: {
            type: String,
            required: false,
        },
        price: {
            type: Number,
            required: false,
        },
        photo: {
            type: String,
            required: false,
        },
        time: {
            type: String,
            required: false,
        },
        discription: {
            type: String,
            required: false,
        },
        isVerifyedByAdmin: {
            type: String,
            required: false,
            default: false,
        },
        shop: {
            type: Schema.Types.ObjectId,
            ref: "Shop"
        }
    });

const ShopSchema = new Schema(
    {
        owner: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        shopName: {
            type: String,
            required: true,
        },
        phone: {
            type: Number,
            required: true,

        },
        address: {
            type: String,
            required: false,
        },
        pincode: {
            type: Number,
            required: false,
            maxlength: 6,
            minlength: 6,
        },
        logo: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now(),
        },
        verified: {
            type: Boolean,
            required: false,
            default: false,
        },
        isVeifyedByAdmin: {
            type: Boolean,
            required: false,
            default: false,
        },
        gallery: {
            type: [String],
            required: false,
        },
        location: {
            type: String,
            required: false,
        },
        services: {
            type: [ServiceSchema],
            required: false,
        },
        // services: [{
        //     type: Schema.Types.ObjectId,
        //     ref: "Services",
        //     required: false,
        // }],

    },
    { timestamps: true }
);

ShopSchema.methods.generateVerificationToken = function () {
    const shop = this;
    console.log("shop ", shop._id);
    console.log(
        "process.env.USER_VERIFICATION_TOKEN_SECRET ",
        process.env.USER_VERIFICATION_TOKEN_SECRET
    );
    const verificationToken = jwt.sign(
        { ID: shop._id },
        process.env.USER_VERIFICATION_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return verificationToken;
};

/**
 *  Here we are creating and setting an id property and 
    removing _id, __v, and the password hash which we do not need 
    to send back to the client.
 */
ShopSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        //do not reveal passwordHash
        delete returnedObject.password;
    },
});

/**
 * 1. The userSchema.plugin(uniqueValidator) method won’t let duplicate email id to be stored in the database.
 * 2. The unique: true property in email schema does the internal optimization to enhance the performance.
 */
ShopSchema.plugin(uniqueValidator, { message: "Email already in use." });

const Shop = mongoose.model("Shop", ShopSchema);
const Services = mongoose.model("Services", ServiceSchema);
module.exports = Shop;
// module.exports = Services;