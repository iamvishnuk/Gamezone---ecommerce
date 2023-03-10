const express = require('express')
const user_route = express()
const path = require('path')
const userController = require('../controllers/user_controller')
const userAuth = require("../middlewares/user.auth")
const cartController = require('../controllers/cart_controller')
const orderController = require("../controllers/order_controller")
const couponController = require('../controllers/coupon_controller')


// user_route.set('view engine', 'ejs')
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

// filter product by brand
user_route.get("/filter",userController.filterProducts)

// single product paget get method
user_route.get("/singleproductpage/:id", userController.singleProductPage)

//cart get method ========================================================
user_route.get("/cart",userAuth.isLogin, cartController.getcart)

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

// change user password
user_route.post('/change-password',userController.changeUserPassword)

// view all addresses
user_route.get("/manageaddress",userController.allAddressesPage)

// add new address post 
user_route.post("/add-address", userController.addAddress)

// add new address form the checkout page
user_route.post("/add-address-checkoutpage",userController.checkoutPageAddAddress)

// delete address 
user_route.get("/delete-address/:id", userController.deleteAddress)

// get edit address page
// user_route.get("/editaddress/:id",userController.editAddressPage)

// post edit address-------------------------------------------------------------------------------------------
user_route.post("/post-edit-address",userController.postEditAddress)

// get checkoutpage
user_route.get("/gotocheckoutpage",userAuth.isLogin,orderController.getChekoutPage)

// post checkout page 
user_route.post("/postcheckout",orderController.postCheckout)

// verify payment 
user_route.post("/verify-payment",orderController.verifyPayment)

//faild payment
user_route.post("/faild-payment",orderController.faildPayment)

// get order confirmation page
user_route.get("/orderconfirmation",userAuth.isLogin,orderController.orderConfirmationPage)

// view previous orders 
user_route.get("/orders",userAuth.isLogin,orderController.viewOrder)

// single order view
user_route.get("/viweorder/:id",userAuth.isLogin,orderController.viewSingleOrder)

// cancel order
user_route.post("/cancelorder",orderController.cancelOrder)

// retrun order
user_route.post('/return-order',orderController.returnOrder)

// search products
user_route.post("/getProduct",userController.searchProducts)

// apply coupon 
user_route.post("/apply-coupon",couponController.applyCoupon)



// user Logout 
user_route.get('/userlogout', userAuth.userLogout)


user_route.use((req,res)=>{
    res.render("error")
})


module.exports = user_route