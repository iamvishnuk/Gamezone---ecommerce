const mongoose = require('mongoose')
require('dotenv').config()
const url = process.env.MONGOOSE_URL

mongoose.connect(url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>{
    console.log("Connected to gamezone")
}).catch(err => console.log("Error connecting to gamezone" + err))