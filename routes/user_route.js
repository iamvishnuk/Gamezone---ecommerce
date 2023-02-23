const express = require('express')
const user_route = express()
const path = require('path')
const userController = require('../controllers/user_controller')
const userAuth = require("../middlewares/user.auth")
const cartController = require('../controllers/cart_controller')


user_route.set('view engine', 'ejs')
user_route.set('views', './views/user')


// user home page
user_route.get('/', userController.userHome)

// user get loogin page
user_route.get("/userlogin", userAuth.isLogout, userController.userLogin)

//user login post method
user_route.post('/userlogin', userController.doLogin)

//user get signup page
user_route.get('/usersignup', userAuth.isLogout, userController.userSignup)

// user signup page post 
user_route.post('/usersignup', userController.verifyUser)

// verify user opt
user_route.post('/userotp', userController.verifyOtp)

// product page get method
user_route.get("/products", userController.productsPage)

// single product paget get method
user_route.get("/singleproductpage/:id", userController.singleProductPage)

//cart get method ========================================================
user_route.get("/cart", cartController.getcart)

// cart post method
user_route.get("/addtocart/:id", cartController.addToCart)

// cart quantity increment post method
user_route.post("/increment-quantity", cartController.incrementQuantity)

// remove cart item 
user_route.get("/cart-remove/:id", cartController.removeCart)

// wishlist get method======================================
user_route.get("/wishlist", userController.getWishlist)

// wishlist post method
user_route.post("/addtowishlist", userController.addToWishlist)

// remove wishlist item
user_route.get("/removeWishlist/:id", userController.removeFromwishlist)

// user profile page
user_route.get("/userprofile", userController.getUserProfile)

// user profile edit 
user_route.post("/edituserprofile",userController.editUserProfile)

// view all addresses
user_route.get("/manageaddress",userController.allAddressesPage)

// add new address post 
user_route.post("/add-address", userController.addAddress)

// delete address 
user_route.get("/delete-address/:id", userController.deleteAddress)

// get edit address page
user_route.get("/editaddress/:id",userController.editAddressPage)

// post edit address
user_route.post("/post-edit-address/:id",userController.postEditAddress)






// user Logout 
user_route.get('/userlogout', userAuth.userLogout)


module.exports = user_route