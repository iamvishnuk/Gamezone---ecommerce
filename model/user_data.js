const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true
    },
    date: {
        type: Date,
        require: true,
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
    },
    wishlist: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    }]


})

module.exports = mongoose.model('user', userData)
