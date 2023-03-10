const User = require("../model/user_data")
const Product = require("../model/products_data")
const Category = require("../model/category_data")
const Coupon = require("../model/coupon_data")
const Order = require("../model/orders_data")
const { v4: uuidv4 } = require('uuid');
const moment = require("moment")
const Razorpay = require('razorpay');
require('dotenv').config()
const crypto = require("crypto")

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

// get chekout page
const getChekoutPage = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const user = await User.findOne({ _id: userId })
        const address = user.addresses

        if (user.cart.length == 0) {

            res.redirect('/cart')

        } else {

            const cartItem = await User.findOne({ _id: userId }).populate('cart.productId')
            res.render("checkoutpage", { address: address, user: user, cartItem: cartItem })

        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}


// post checkout page
const postCheckout = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const orderData = req.body
        const productIds = orderData.productId
        const couponCode = req.body.couponCode



        if (req.body.paymentMethod === "cod") {

            if (!Array.isArray(orderData.productId)) {
                orderData.productId = [orderData.productId]
            }
            if (!Array.isArray(orderData.quantity)) {
                orderData.quantity = [orderData.quantity]
            }
            if (!Array.isArray(orderData.productTotal)) {
                orderData.productTotal = [orderData.productTotal]
            }
            const orderDetails = []

            for (let i = 0; i < orderData.productId.length; i++) {
                const productId = orderData.productId[i]
                const quantity = orderData.quantity[i]
                const productTotal = orderData.productTotal[i]
                orderDetails.push({ productId: productId, quantity: quantity, productTotal: productTotal })
            }

            const orders = new Order({
                userId: userId,
                deliveryAddress: orderData.address,
                product: orderDetails,
                discountAmount: orderData.discountAmount,
                total: orderData.total,
                paymentType: orderData.paymentMethod,
                orderId: `order_id${uuidv4()}`,
                date: Date.now()
            })
            const ordered = await orders.save().then((response) => {
                console.log(response + "haiiiiiiiiiiiiiiiiiiiii")
            })

            await Coupon.updateOne({ code: couponCode }, { $push: { usersUsed: userId } }) //adding the already coupon used users

            res.json({ codStatus: true })


        } else if (req.body.paymentMethod === "razorpay") {

            if (!Array.isArray(orderData.productId)) {
                orderData.productId = [orderData.productId]
            }
            if (!Array.isArray(orderData.quantity)) {
                orderData.quantity = [orderData.quantity]
            }
            if (!Array.isArray(orderData.productTotal)) {
                orderData.productTotal = [orderData.productTotal]
            }
            const orderDetails = []

            for (let i = 0; i < orderData.productId.length; i++) {
                const productId = orderData.productId[i]
                const quantity = orderData.quantity[i]
                const productTotal = orderData.productTotal[i]
                orderDetails.push({ productId: productId, quantity: quantity, productTotal: productTotal })
            }
            // console.log(orderDetails);

            const orders = new Order({
                userId: userId,
                deliveryAddress: orderData.address,
                product: orderDetails,
                discountAmount: orderData.discountAmount,
                total: orderData.total,
                paymentType: orderData.paymentMethod,
                orderId: `order_id${uuidv4()}`,
                date: Date.now(),
                status: "Pending"
            })
            const ordered = await orders.save()

            await Coupon.updateOne({ code: couponCode }, { $push: { usersUsed: userId } }) //adding the already coupon used users

            const lastOrder = await Order.findOne({}).sort({ date: -1 })
            const lastOrderDetails = await Order.findOne({ _id: lastOrder._id }).populate("product.productId")

            var options = {
                amount: lastOrderDetails.total * 100,
                currency: 'INR',
                receipt: "" + lastOrderDetails._id
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({ razorpay: true, order: order })
                }
            })

        } else if (req.body.paymentMethod === "wallet") {

            const user = await User.findOne({ _id: userId })
            console.log(user)
            if (orderData.total >= user.wallet) {

                res.json({ amoutExceeded: true })

            } else {

                if (!Array.isArray(orderData.productId)) {
                    orderData.productId = [orderData.productId]
                }
                if (!Array.isArray(orderData.quantity)) {
                    orderData.quantity = [orderData.quantity]
                }
                if (!Array.isArray(orderData.productTotal)) {
                    orderData.productTotal = [orderData.productTotal]
                }
                const orderDetails = []

                for (let i = 0; i < orderData.productId.length; i++) {
                    const productId = orderData.productId[i]
                    const quantity = orderData.quantity[i]
                    const productTotal = orderData.productTotal[i]
                    orderDetails.push({ productId: productId, quantity: quantity, productTotal: productTotal })
                }


                const orders = new Order({
                    userId: userId,
                    deliveryAddress: orderData.address,
                    product: orderDetails,
                    discountAmount: orderData.discountAmount,
                    total: orderData.total,
                    paymentType: orderData.paymentMethod,
                    orderId: `order_id${uuidv4()}`,
                    date: Date.now()
                })
                const ordered = await orders.save()

                // degressing the wallet amout
                await User.updateOne({ _id: userId }, { $inc: { wallet: -orderData.total } })

                await Coupon.updateOne({ code: couponCode }, { $push: { usersUsed: userId } }) //adding the already coupon used users

                res.json({ walletStatus: true })

            }

        }


    } catch (error) {
        res.json({ address: true })
        console.log(error.message)
        next(error)
    }
}

// verify payment 
const verifyPayment = async (req, res, next) => {
    try {

        const details = req.body
        let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == details.payment.razorpay_signature) {

            await Order.updateOne({ _id: details.order.receipt }, { status: "Order Confirmed" })
            res.json({ payment: true })

        } else {
            console.log("payment not verified");
        }

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// faild payment
const faildPayment = async (req, res, next) => {
    try {

        const orderDetails = req.body
        await Order.updateOne({ _id: orderDetails.order.receipt }, { status: "Payment faild" }).then(() => {
            res.json({ paymentFailed: true, reason: orderDetails.description })
        })

    } catch (error) {
        console.log(error);
        next(error)
    }
}

// order confirmation page 
const orderConfirmationPage = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const user = await User.findOne({ _id: userId })

        const lastOrder = await Order.findOne({}).sort({ date: -1 })
        const lastOrderDetails = await Order.findOne({ _id: lastOrder._id }).populate("product.productId")

        for (let i = 0; i < lastOrder.product.length; i++) {
            const quantity = lastOrder.product[i].quantity;
            const proId = lastOrder.product[i].productId;
            await Product.updateOne({ _id: proId }, { $inc: { stock: -quantity } })
        }

        await User.updateOne({_id:userId},{$set:{
            cart: []
        }})

        res.render("orderconfirmpage", { user: user, orderDatas: lastOrderDetails, moment: moment })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// view previous order user side 
const viewOrder = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const user = await User.findOne({ _id: userId })
        const orderData = await Order.find({ userId: userId }).populate('product.productId').sort({ date: -1 })

        res.render("orders", { user: user, orderData: orderData })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// single order view
const viewSingleOrder = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const orderId = req.params.id
        const user = await User.findOne({ _id: userId })
        const orderData = await Order.findOne({ orderId: orderId }).populate("product.productId")
        res.render("singleorderpage", { orderData: orderData, moment: moment, user: user })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// cancel ordre
const cancelOrder = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const orderId = req.body.orderId
        const value = req.body.value
        const canceledOrder = await Order.findOne({ orderId: orderId })
        for (let i = 0; i < canceledOrder.product.length; i++) {
            const quantity = canceledOrder.product[i].quantity;
            const proId = canceledOrder.product[i].productId;
            await Product.updateOne({ _id: proId }, { $inc: { stock: quantity } })
        }
        if (canceledOrder.paymentType == "razorpay" || canceledOrder.paymentType == "wallet") {
            const wallet = await User.updateOne({ _id: userId }, { $inc: { wallet: canceledOrder.total } }).then((response) => {
                console.log(response);
            })
        }
        await Order.updateOne({ orderId: orderId }, { $set: { status: value } }).then(() => {

            res.json({ success: true, value })
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const returnOrder = async (req, res, next) => {
    try {

        const userId = req.session.userId
        const orderId = req.body.orderId
        const returnOrderData = await Order.findOne({ orderId: orderId })

        //updating the quantity of the product
        for (let i = 0; i < returnOrderData.length; i++) {
            const quantity = returnOrderData[i].quantity
            const proId = returnOrderData[i].productId
            await Product.updateOne({ _id: proId }, { $inc: { stock: quantity, } })
        }

        await User.updateOne({ _id: userId }, { $inc: { wallet: returnOrderData.total } })
        await Order.updateOne({ orderId: orderId }, { $set: { status: "Retruned" } })

        res.json({ success: true })

    } catch (error) {
        console.log(error);
        next(error)
    }
}


module.exports = {
    getChekoutPage,
    postCheckout,
    viewOrder,
    cancelOrder,
    orderConfirmationPage,
    verifyPayment,
    faildPayment,
    viewSingleOrder,
    returnOrder,
}