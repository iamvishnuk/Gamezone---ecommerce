const Product = require("../model/products_data")
const Users = require("../model/user_data")
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID
const client = require('twilio')(accountSid, authToken);
const bycrpt = require('bcrypt');
const { ObjectId } = require("mongodb");
const { response } = require("express");
const { LogContextImpl } = require("twilio/lib/rest/serverless/v1/service/environment/log");
let session;


//user login page
const userLogin = async (req, res) => {
    try {
        res.render('user_login')
    } catch (error) {
        console.log(error.message);
    }
}

const doLogin = async (req, res) => {
    try {

        const userName = req.body.username
        const password = req.body.password



        const userDetails = await Users.findOne({ username: userName })
        if (userDetails) {
            if (userDetails.blocked === false) {
                bycrpt.compare(password, userDetails.password).then((status) => {
                    if (status) {

                        session = req.session
                        session.user = userDetails

                        res.redirect('/')
                    } else {
                        res.render('user_login', { message: 'Password is incorrect !...' })
                    }
                })
            } else {
                console.log("blocked")
                res.render('user_login', { message: 'Account is blocked !...' })
            }

        } else {
            console.log("login failed")
            res.render('user_login', { message: 'Username id incorrect !...' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//uer signup page
const userSignup = async (req, res) => {
    try {
        res.render('usersignup')
    } catch (error) {
        console.log(error.messge)
    }
}

//user signup post fuction
const verifyUser = async (req, res) => {
    try {

        const userEmail = req.body.email
        const reqexEmail = new RegExp(userEmail, 'i')
        const findUserEmail = await Users.find({ email: reqexEmail })
        const dataLength = findUserEmail.length

        if (dataLength === 1) {

            res.render("usersignup", { error: "Email is already in use" })

        } else {

            // console.log(req.body);
            const number = req.body.phone
            req.session.user = req.body
            const otpResponse = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: `+91${number}`,
                    channel: 'sms'
                })
            res.render("user_otp")

        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async (req, res) => {
    try {

        const userData = req.session.user

        const otp = req.body.otp
        const verifyUserOtp = await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({
                to: `+91${userData.phone}`,
                code: otp,
            }).then(async (verifications) => {
                if (verifications.status === "approved") {
                    userData.password = await bycrpt.hash(userData.password, 10)
                    const userDetails = new Users({

                        firstName: userData.firstName,
                        lastName: userData.lname,
                        username: userData.username,
                        email: userData.email,
                        password: userData.password,
                        phone: userData.phone

                    })
                    const userDetailsData = await userDetails.save()
                    if (userDetailsData) {
                        res.redirect('/')
                    }


                } else {
                    console.log("opt not matched");
                }
            })
    } catch (error) {
        console.log(error.message);
    }
}




//user home page
const userHome = async (req, res) => {
    try {
        if (req.session.user) {

            const user = req.session.user
            const wishlist = await Users.find({ _id: user._id }).populate('wishlist').lean().exec()
            const wish = wishlist[0].wishlist

            const wishdata = []
            wish.forEach(element => {
                wishdata.push(element.product_name)
            });

            const product = await Product.find({ list: true }).limit(4)
            res.render('user_home', { productData: product, user: user, wishlist: wishdata })

        } else {

            const product = await Product.find({ list: true }).limit(4);
            res.render('user_home', { productData: product, wishlist:"null"})

        }

    } catch (error) {
        console.log(error.message);
    }
}

//product page 
const productsPage = async (req, res) => {
    try {
        if (req.session.user) {
            const user = req.session.user

            const wishlist = await Users.find({ _id: user._id }).populate('wishlist').lean().exec()
            const wish = wishlist[0].wishlist

            const wishdata = []
            wish.forEach(element => {
                wishdata.push(element.product_name)
            });

            const product = await Product.find({ list: true })
            res.render('products_page', { productData: product, user: user, wishlist: wishdata })
        } else {
            const product = await Product.find({ list: true })
            res.render('products_page', { productData: product, wishlist:'null' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

// single product page 
const singleProductPage = async (req, res) => {
    try {

        if (req.session.user) {

            const productID = req.params.id
            const user = req.session.user

            const cartCheck = await Users.findOne({ _id: user._id, 'cart.productId': productID }, { 'productId.$': 1 })
            if (cartCheck) {
                var exist = "Go to cart"
            }

            const productDetails = await Product.findOne({ _id: productID })
            console.log(productDetails);

            res.render('singleproductpage', { productDetails: productDetails, user: user, exist: exist })

        } else {

            const productId = req.params.id
            const user = req.session.user

            const productDetails = await Product.findOne({ _id: productId })
            res.render('singleproductpage', { productDetails: productDetails })

        }

    } catch (error) {
        console.log(error.message);
    }
}

// cart get method
const getcart = async (req, res) => {
    try {
        if (req.session.user) {

            const user = req.session.user
            const cartData = await Users.findOne({ _id: user._id },).populate('cart.productId').lean().exec()

            console.log(cartData);

            res.render('cart', { cartItems: cartData, user: user })

        } else {

            res.redirect('/userlogin')

        }
        res.render('cart')

    } catch (error) {
        console.log(error.message);
    }
}

// add to cart post function
const addToCart = async (req, res) => {
    try {

        if (req.session.user) {

            const user = req.session.user
            const proId = req.params.id

            const productData = await Product.findOne({ _id: proId })

            const cartUpdate = await Users.updateOne({ _id: user._id }, { $push: { cart: { productId: proId, productTotalPrice: productData.price } } }).then((response) => {
                res.redirect("/cart")
            })

        } else {
            res.redirect('/userlogin')
        }

    } catch (error) {

    }
}

// cart quantity increment function
const incrementQuantity = async (req, res) => {
    try {

        if (req.session.user) {

            const user = req.session.user
            const proId = req.body.productId
            const count = req.body.count
            const pPrice = req.body.pPrice

            const increment = await Users.updateOne(
                { _id: user._id, "cart.productId": proId },
                { $inc: { 'cart.$.quantity': count } }
            )
            const cartItem = await Users.findOne({ _id: user._id, "cart.productId": proId }, { "cart.$": 1 })
            const productTotal = pPrice * cartItem.cart[0].quantity

            const pTotal = await Users.updateOne(
                { _id: user._id, "cart.productId": proId },
                { $set: { 'cart.$.productTotalPrice': productTotal } }
            )
            
            res.json({ success: true, productTotal })

        }

    } catch (error) {
        console.log(error.message)
    }
}

// cart item remove function
const removeCart = async (req, res) => {
    try {
        const proId = req.params.id
        const user = req.session.user

        console.log(proId);

        const removeItem = await Users.updateOne({ _id: user._id }, { $pull: { cart: { productId: proId } } }).then((response) => {
            res.redirect("/cart")
        })

    } catch (error) {
        console.log(error.message)
    }
}

// ==================== wishlist =================
const getWishlist = async (req, res) => {
    try {

        if (req.session.user) {

            const user = req.session.user
            const wishlist = await Users.find({ _id: user._id }).populate('wishlist').lean().exec()
            const wishData = wishlist[0].wishlist


            // const wishdata = []
            // wish.forEach(eement => {
            //     wishdata.push(element.product_name)
            // });

            res.render('wishlist',{wishData:wishData, user:user})

        } else {

            res.redirect('/userlogin')

        }

    } catch (error) {
        console.log(error.message)
    }
}

// add to wishlist post method
const addToWishlist = async (req, res) => {
    try {

        if (req.session.user) {

            const proId = req.body.productId
            const user = req.session.user

            const cartUpdate = await Users.updateOne({ _id: user._id }, { $push: { wishlist:  proId  } }).then((response) => {
                res.json(response)
            })

        } else {

            res.redirect('/userlogin')

        }

    } catch (error) {
        console.log(error.message)
    }
}

const removeFromwishlist = async( req,res )=>{
    try {

        const proId = req.params.id
        const user = req.session.user

        const cartUpdate = await Users.updateOne({ _id: user._id }, { $pull: { wishlist: proId } }).then(()=>{
            res.redirect("/wishlist")
        })

        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    userHome,
    userLogin,
    userSignup,
    verifyUser,
    verifyOtp,
    doLogin,
    productsPage,
    singleProductPage,
    getcart,
    addToCart,
    incrementQuantity,
    removeCart,
    getWishlist,
    addToWishlist,
    removeFromwishlist
}