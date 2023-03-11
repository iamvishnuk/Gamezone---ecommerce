const mongoose = require("./config/mongo")
const path = require('path')
const express = require('express')
const app = express()
const session = require('express-session')
const nocache = require('nocache')
const logger = require('morgan')


app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(session({
    secret: "thissecretkeyabcdefghijklmnopqrstuvwxyz",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
}))

app.use(logger('dev'))

app.use(express.static(path.join(__dirname, 'public')));


// for admin routes
const adminRoutes = require('./routes/admin_route')
app.use('/admin', adminRoutes)

// for user routes
const userRoutes = require('./routes/user_route')
app.use('/', userRoutes)

app.use((err, req, res, next)=>{
    console.log(err.stack)
    res.status(500).send(err.stack)
})

app.listen(3000, () => {
    console.log("server is runnig");
})

