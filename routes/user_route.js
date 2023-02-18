const express = require('express')
const user_route = express()
const path = require('path')
const userController = require('../controllers/user_controller')
const userAuth = require("../middlewares/user.auth")


user_route.set('view engine', 'ejs')
user_route.set('views', './views/user')


// user home page
user_route.get('/',userController.userHome)

// user get loogin page
user_route.get("/userlogin",userAuth.isLogout,userController.userLogin)

//user login post method
user_route.post('/userlogin',userController.doLogin)

//user get signup page
user_route.get('/usersignup',userAuth.isLogout,userController.userSignup)

// user signup page post 
user_route.post('/usersignup',userController.verifyUser)

// verify user opt
user_route.post('/userotp',userController.verifyOtp)

// product page get method
user_route.get("/products",userController.productsPage)

// single product paget get method
user_route.get("/singleproductpage/:id",userController.singleProductPage)

//cart get method ----------------------------------------------------------------
user_route.get("/cart",userController.getcart)

// cart post method
user_route.get("/addtocart/:id",userController.addToCart)

// cart quantity increment post method
user_route.post("/increment-quantity",userController.incrementQuantity)


// user Logout 
user_route.get('/userlogout',userAuth.userLogout)

module.exports = user_route