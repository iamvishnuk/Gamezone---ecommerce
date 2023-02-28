const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/gamezone",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>{
    console.log("Connected to gamezone")
}).catch(err => console.log("Error connecting to gamezone" + err))