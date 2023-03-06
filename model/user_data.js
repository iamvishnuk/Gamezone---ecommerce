const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    blocked: {
        type: Boolean,
        default: false
    },
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1
        },
        productTotalPrice: {
            type: Number,
        },
    }],
    cartTotalPrice: {
        type: Number,
        default:0
    },
    wishlist: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    }],
    addresses:[{
        name:{
            type: String,
            required:true,
        },
        phoneNumber:{
            type: String,
            required: true
        },
        houseName:{
            type: String,
            required: true,
        },
        street:{
            type: String,
            required: true,
        },
        district:{
            type: String,
            required: true
        },
        state:{
            type: String,
            required:true
        },
        pincode: {
            type: String,
            required: true
        }

    }],
    wallet:{
        type: Number,
        default: 0,
        required: true
    }



})

module.exports = mongoose.model('user', userData)
