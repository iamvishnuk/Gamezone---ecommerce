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

            // console.log(userData);
            const product = await Product.find({ list: true }).limit(4)
            // console.log(product);
            res.render('user_home', { productData: product, user: user })
        } else {
            // console.log(userData);
            const product = await Product.find({ list: true }).limit(4)
            // console.log(product);
            res.render('user_home', { productData: product })
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
            const product = await Product.find({ list: true })
            res.render('products_page', { productData: product, user: user })
        } else {
            const product = await Product.find({ list: true })
            res.render('products_page', { productData: product })
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

            const productIdToCheck = productID

            // check if the productId exists in the cart array
            const productExists = user.cart.some((cartItem) => {
                return cartItem.productId === productIdToCheck
            });

            if (productExists) {
                console.log(`Product ${productIdToCheck} exists in cart`);
                var exist = "Go to cart"
            } else {
                console.log(`Product ${productIdToCheck} does not exist in cart`);
            }
            
            const productDetails = await Product.findOne({ _id: productID })

            res.render('singleproductpage', { productDetails: productDetails, user: user, exist:exist })

        } else {

            const productId = req.params.id
            const user = req.session.user
            console.log(productId);

            const productDetails = await Product.findOne({ _id: productId })
            console.log(productDetails);
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
            // console.log(user._id);
            const productData = await Product.findOne({ _id: proId })

            console.log(productData)

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
const incrementQuantity = async (req, res)=>{
    try {

        if(req.session.user){

            const user = req.session.user
            const proId = req.body.productId
            const count = req.body.count

            const increment = await Users.updateOne(
                {_id:user._id, "cart.productId":proId},
                {$inc:{'cart.$.quantity':count}}
            ).then((response)=>{
                res.json(response)
            })

        }

    } catch (error) {
        console.log(error.message)
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
    incrementQuantity
}