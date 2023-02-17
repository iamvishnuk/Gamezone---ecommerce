const Product = require("../model/products_data")
const Users = require("../model/user_date")
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID
const client = require('twilio')(accountSid, authToken);
const bycrpt = require('bcrypt');
const { ObjectId } = require("mongodb");
var session;


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

        // console.log(userName, password)

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
        console.log(userData);

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

            const productId = req.params.id
            const user = req.session.user
            // console.log(productId);

            const productDetails = await Product.findOne({ _id: productId })
            // console.log(productDetails);
            res.render('singleproductpage', { productDetails: productDetails, user: user })

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

      
            console.log(user)




            res.render('cart')


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

            const userId = req.session.user
            const proId = req.params.id

            console.log(userId._id);

            const productData = await Product.find({ _id: proId })

            const cartUpdate = await Users.updateOne({ _id: userId._id }, { $push: { cart: { _id: new ObjectId, product: proId, quantity: 1 } } }).then((response) => {
                console.log(response)
                res.redirect("/cart")
            })
            console.log(productData)

        } else {
            res.redirect('/userlogin')
        }

    } catch (error) {

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
    addToCart
}