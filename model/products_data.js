const mongoose = require('mongoose');

const productData = new mongoose.Schema({
    product_name: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: true
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"category",
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    list:{
        type:Boolean,
        required:true,
        default:true
    }
})

module.exports = mongoose.model('product', productData)