const mongoose = require('mongoose');

const categoryData = new mongoose.Schema({
    categoryName: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    categoryImage:{
        type: String,
        require:true
    },
    date: {
        type: Date,
        require: true,
        default: Date.now()
    }
})

module.exports = mongoose.model('category', categoryData)