const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/gamezone")
const path = require('path')
const express = require('express')
const app = express()
const session = require('express-session')
const nocache = require('nocache')
const logger = require('morgan')


app.use(nocache())
const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: "thissecretkeyabcdefghijklmnopqrstuvwxyz",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
}))
// app.use(logger('dev'))

app.use(express.static(path.join(__dirname, 'public')));


// for admin routes
const adminRoutes = require('./routes/admin_route')
app.use('/admin', adminRoutes)

// for user routes
const userRoutes = require('./routes/user_route')
app.use('/', userRoutes)



app.listen(3000, () => {
    console.log("server is runnig");
})

