const mongoose = require('mongoose');

const cartData = new mongoose.Schema({
    categoryName: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true,
        default: Date.now()
    }
})

module.exports = mongoose.model('cart', cartData)