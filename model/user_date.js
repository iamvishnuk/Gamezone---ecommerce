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
    blocked:{
        type: Boolean,
        default:false
    },
    cart:{
        type: Array
    }
})

module.exports = mongoose.model('user', userData)
