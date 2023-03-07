const Product = require("../model/products_data")
const Users = require("../model/user_data")
const Category = require("../model/category_data")
const Banner = require("../model/banner_data")
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID
const client = require('twilio')(accountSid, authToken);
const bycrpt = require('bcrypt');
const { response } = require("../routes/user_route")
const proCount = 8



//user login page
const userLogin = async (req, res, next) => {
    try {
        res.render('user_login')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const doLogin = async (req, res, next) => {
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
        next(error)
    }
}

//uer signup page
const userSignup = async (req, res, next) => {
    try {
        res.render('usersignup')
    } catch (error) {
        console.log(error.messge)
        next(error)
    }
}

//user signup post fuction
const verifyUser = async (req, res, next) => {
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
        next(error)
    }
}

const verifyOtp = async (req, res, next) => {
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
                    res.render("user_otp", { otperr: "opt not matched" })
                }
            })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}




//user home page
const userHome = async (req, res, next) => {
    try {

        const bannerData = await Banner.find({})
        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const product = await Product.find({ list: true }).limit(4)

            const category = await Category.find({})
            res.render('user_home', { productData: product, user: user, category: category, bannerData: bannerData })

        } else {

            const product = await Product.find({ list: true }).limit(4);
            const category = await Category.find({})
            res.render('user_home', { productData: product, wishlist: "null", category: category, bannerData: bannerData })

        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

/// limit the number of product function
async function getProducts(page) {
    const skip = (page - 1) * proCount
    const products = await Product.find({ list: true }).populate('category').skip(skip).limit(proCount).exec()
    return products
}

//product page 
const productsPage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const products = await getProducts(page)
        const count = await Product.countDocuments().exec()
        const totalPages = Math.ceil(count / proCount)
        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const wishlist = await Users.find({ _id: user._id }).populate('wishlist').lean().exec()
            const wish = wishlist[0].wishlist

            const wishdata = []
            // wish.forEach(element => {
            //     wishdata.push(element.product_name)
            // });

            // const product = await Product.find({ list: true }).populate('category')
            res.render('products_page', { productData: products, user: user, wishlist: wishdata, page, totalPages })
        } else {
            // const product = await Product.find({ list: true }).populate('category')
            res.render('products_page', { productData: products, wishlist: 'null', page, totalPages })
        }

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// filter products by brand name
const filterProducts = async (req, res, next) => {
    try {

        const brand = req.query.brand
        const product = await Product.find({ list: true, brand: brand }).populate('category')
        const wishData = []
        const page = null
        const totalPages = null

        if(req.session.userId){

            const userId = req.session.userId
            const user = await Users.findOne({_id: userId})
            res.render("products_page",{productData:product, user: user, wishlist: wishData, page, totalPages})

        }else{

            res.render("products_page", { productData: product, wishlist: 'null', page, totalPages })

        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// single product page 
const singleProductPage = async (req, res, next) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            console.log(userId);
            const user = await Users.findOne({ _id: userId })
            // console.log(user)
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
        next(error)
    }
}

// cart get method


// ==================== wishlist =================
const getWishlist = async (req, res, next) => {
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
        next(error)
    }
}

// add to wishlist post method
const addToWishlist = async (req, res, next) => {
    try {

        const proId = req.body.productId
        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })

        const wishlits = await Users.findOne({ _id: userId, 'wishlist': proId })

        if (wishlits) {
            console.log("all ready existing");
        } else {

            const cartUpdate = await Users.updateOne({ _id: user._id }, { $push: { wishlist: proId } }).then((response) => {
                res.json(response)
            })
        }



    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const removeFromwishlist = async (req, res, next) => {
    try {

        const proId = req.params.id
        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })

        const cartUpdate = await Users.updateOne({ _id: user._id }, { $pull: { wishlist: proId } }).then(() => {
            res.redirect("/wishlist")
        })


    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


// user profile +===========================================
const getUserProfile = async (req, res, next) => {
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
        next(error)
    }
}

// user profile edit 
const editUserProfile = async (req, res, next) => {
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
        next(error)
    }
}

// change user password-------------------------------------------------------
const changeUserPassword = async (req, res, next) => {
    try {

        const password = req.body.oldPassword
        const newPassword = req.body.newPassword
        let confirmPassword = req.body.confirmPassword
        const user = await Users.findOne({ _id: req.session.userId })
        console.log(user)

        bycrpt.compare(password, user.password).then(async (status) => {
            if (status) {
                if (newPassword === confirmPassword) {

                    confirmPassword = await bycrpt.hash(confirmPassword, 10)
                    await Users.updateOne({ _id: user._id }, { password: confirmPassword })
                    res.json({ change: true })
                } else {
                    res.json({ matchfailed: true })
                }
            } else {
                console.log("yor password wrong")
                res.json({ wrongPassword: true })
            }
        })


    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// view all addresses
const allAddressesPage = async (req, res, next) => {
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
        next(error)
    }
}

// add new address
const addAddress = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })
        console.log(user._id)
        console.log(req.body)

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
        ).then((response) => {
            console.log(response);
            res.redirect("/manageaddress")
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// add address from the checkout page
const checkoutPageAddAddress = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })

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
        ).then((response) => {
            res.json(response)
            // res.redirect("/gotocheckoutpage")
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// delete address 
const deleteAddress = async (req, res, next) => {
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
        next(error)
    }
}

// edit address page
const editAddressPage = async (req, res, next) => {
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
        next(error)
    }
}

// post edit address 
const postEditAddress = async (req, res, next) => {
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
        next(error)
    }
}

// search products 
const searchProducts = async (req, res, next) => {
    try {

        let payload = req.body.payload
        console.log(payload)
        let searchKey = new RegExp(payload, 'i')
        let search = await Product.find({ product_name: searchKey })
        search = search.slice(0, 4);
        res.send({ payload: search })


    } catch (error) {
        console.log(error.message);
        next(error)
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
    checkoutPageAddAddress,
    deleteAddress,
    editAddressPage,
    postEditAddress,
    searchProducts,
    changeUserPassword,
    filterProducts
}