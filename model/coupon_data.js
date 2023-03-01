const mongoose = require('mongoose')

const couponData = new mongoose.Schema({
    code:{
        type: String,
        required:true,
        unique: true
    },
    percentageOff:{
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    maxDiscount:{
        type : Number,
        required: true,
        min: 0
    },
    expiryDate:{
        type: Date,
        required: true
    },
    minimumPurchseAmount: {
        type: Number,
        required: true
    },
    usersUsed:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
})

module.exports = mongoose.model('coupon',couponData)