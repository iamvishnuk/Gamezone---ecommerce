const Product = require("../model/products_data")
const Users = require("../model/user_data")
const Category = require("../model/category_data")
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID
const client = require('twilio')(accountSid, authToken);
const bycrpt = require('bcrypt');



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

                        req.session.userId = userDetails._id
                        console.log(req.session.userId)

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

            req.session.userId = req.body
            const number = req.session.userId.phone
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

        const number = req.session.userId.phone
        const userData = req.session.userId

        const otp = req.body.otp
        const verifyUserOtp = await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({
                to: `+91${number}`,
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
                    req.session.userId = userDetailsData._id
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
        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const product = await Product.find({ list: true }).limit(4)

            const category = await Category.find({})
            res.render('user_home', { productData: product, user: user, category: category })

        } else {

            const product = await Product.find({ list: true }).limit(4);
            const category = await Category.find({})
            res.render('user_home', { productData: product, wishlist: "null", category: category })

        }

    } catch (error) {
        console.log(error.message);
    }
}

//product page 
const productsPage = async (req, res) => {
    try {
        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const wishlist = await Users.find({ _id: user._id }).populate('wishlist').lean().exec()
            const wish = wishlist[0].wishlist

            const wishdata = []
            // wish.forEach(element => {
            //     wishdata.push(element.product_name)
            // });

            const product = await Product.find({ list: true }).populate('category')
            console.log(product)
            res.render('products_page', { productData: product, user: user, wishlist: wishdata })
        } else {
            const product = await Product.find({ list: true }).populate('category')
            res.render('products_page', { productData: product, wishlist: 'null' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

// single product page 
const singleProductPage = async (req, res) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ userId: userId })
            const productID = req.params.id

            const cartCheck = await Users.findOne({ _id: user._id, 'cart.productId': productID }, { 'productId.$': 1 })
            if (cartCheck) {
                var exist = "Go to cart"
            }

            const productDetails = await Product.findOne({ _id: productID })

            res.render('singleproductpage', { productDetails: productDetails, user: user, exist: exist })

        } else {

            const productId = req.params.id

            const productDetails = await Product.findOne({ _id: productId })
            res.render('singleproductpage', { productDetails: productDetails })

        }

    } catch (error) {
        console.log(error.message);
    }
}

// cart get method


// ==================== wishlist =================
const getWishlist = async (req, res) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })
            const wishlist = await Users.find({ _id: user._id }).populate('wishlist').lean().exec()
            const wishData = wishlist[0].wishlist

            // const wishdata = []
            // wish.forEach(eement => {
            //     wishdata.push(element.product_name)
            // });

            res.render('wishlist', { wishData: wishData, user: user })

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

        if (req.session.userId) {

            const proId = req.body.productId
            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const cartUpdate = await Users.updateOne({ _id: user._id }, { $push: { wishlist: proId } }).then((response) => {
                res.json(response)
            })

        } else {

            res.redirect('/userlogin')

        }

    } catch (error) {
        console.log(error.message)
    }
}

const removeFromwishlist = async (req, res) => {
    try {

        const proId = req.params.id
        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })

        const cartUpdate = await Users.updateOne({ _id: user._id }, { $pull: { wishlist: proId } }).then(() => {
            res.redirect("/wishlist")
        })


    } catch (error) {
        console.log(error.message);
    }
}


// user profile +===========================================
const getUserProfile = async (req, res) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })
            const userDetails = await Users.findOne({ _id: user._id })
            res.render("userprofile", { userDetails: userDetails, user: user })

        } else {
            res.redirect("/userlogin")
        }

    } catch (error) {
        console.log(error.message)
    }
}

// user profile edit 
const editUserProfile = async (req, res) => {
    try {

        const userId = req.session.userId
        const user = await Users.updateOne(
            { _id: userId },
            {
                firsName: req.body.firstname,
                lastName: req.body.lastname,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone
            }
        ).then(() => {
            res.redirect("/userprofile")
        })


    } catch (error) {
        console.log(error.message)
    }
}

// view all addresses
const allAddressesPage = async (req, res) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })
            const address = user.addresses

            res.render("manageaddress", { user: user, address: address })

        } else {
            res.redirect("/userlogin")
        }

    } catch (error) {
        console.log(error.message);
    }
}

// add new address
const addAddress = async (req, res) => {
    try {

        const userId = req.session.userId
        const user = await Users.findOne({ id: userId })

        const address = await Users.updateOne(
            { _id: user._id },
            {
                $push: {
                    addresses: {
                        name: req.body.name,
                        phoneNumber: req.body.phoneNumber,
                        houseName: req.body.houseName,
                        street: req.body.street,
                        district: req.body.district,
                        state: req.body.state,
                        pincode: req.body.pincode
                    }
                }
            }
        ).then(() => {
            res.redirect("/manageaddress")
        })

    } catch (error) {
        console.log(error.message)
    }
}

// delete address 
const deleteAddress = async (req, res) => {
    try {

        const addressId = req.params.id
        console.log(addressId)
        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })
        console.log(user)
        const address = await Users.updateOne({ _id: user._id }, { $pull: { addresses: { _id: addressId } } })
            .then(() => {
                res.redirect('/manageaddress')
            })


    } catch (error) {
        console.log(error.message);
    }
}

// edit address page
const editAddressPage = async (req, res) => {
    try {

        if (req.session.userId) {

            const addressId = req.params.id
            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const addressData = await Users.findOne({ _id: user._id, "addresses._id": addressId }, { "addresses.$": 1, _id: 0 })

            res.render("editaddresspage", { address: addressData.addresses[0] })

        } else {
            res.redirect("/userlogin")
        }

    } catch (error) {
        console.log(error.message);
    }
}

// post edit address 
const postEditAddress = async (req, res) => {
    try {

        const addressId = req.params.id
        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })

        const editAddress = await Users.updateOne(
            { _id: user._id, "addresses._id": addressId },
            {
                $set: {
                    "addresses.$": req.body
                }
            }
        ).then(() => {
            res.redirect("/manageaddress")
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
    getWishlist,
    addToWishlist,
    removeFromwishlist,
    getUserProfile,
    editUserProfile,
    allAddressesPage,
    addAddress,
    deleteAddress,
    editAddressPage,
    postEditAddress,
}