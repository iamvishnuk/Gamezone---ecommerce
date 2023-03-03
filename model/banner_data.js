const mongoose = require('mongoose')

const bannerData = new mongoose.Schema({
    heading:{
        type: String,
        required: true
    },
    subheading: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
    
})

module.exports = mongoose.model('banner',bannerData)