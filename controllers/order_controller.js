const User = require("../model/user_data")
const Product = require("../model/products_data")
const Category = require("../model/category_data")
const Order = require("../model/orders_data")
const { v4: uuidv4 } = require('uuid');
const moment = require("moment")

// get chekout page
const getChekoutPage = async (req, res) => {
    try {

        const userId = req.session.userId
        const user = await User.findOne({ _id: userId })
        const address = user.addresses

        if (user.cart.length == 0) {

            res.redirect('/cart')
            
        } else{

            const cartItem = await User.findOne({ _id: userId }).populate('cart.productId')
            res.render("checkoutpage", { address: address, user: user, cartItem: cartItem })
            
        }
        // else {
        //     res.redirect("/userlogin")
        // }

    } catch (error) {
        console.log(error.message)
    }
}


// post checkout page
const postCheckout = async (req, res) => {
    try {

        const userId = req.session.userId
        const orderData = req.body
        const productIds = orderData.productId
        console.log(productIds)

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
            // console.log(orderDetails);

            const orders = new Order({
                userId: userId,
                deliveryAddress: orderData.address,
                product: orderDetails,
                total: orderData.total,
                paymentType: orderData.paymentMethod,
                orderId:`order_id${uuidv4()}`,
                date: Date.now()
            })

            console.log(Date.now())

            const ordered = await orders.save()

            await User.updateOne(
                { userId: userId },
                { $pull: { cart: { productId: { $in: productIds } } } }
            )

            const lastOrder = await Order.findOne({}).sort({date: -1}) //.limit(1).lean()
            console.log(lastOrder);
            const lastOrderDetails = await Order.findOne({_id: lastOrder._id}).populate("product.productId")
            // console.log(lastOrderDetails);

            res.render("orderconfirmpage", { orderDatas: lastOrderDetails,moment:moment})

        }

    } catch (error) {
        console.log(error.message)
    }
}

// view previous order user side 
const viewOrder = async (req, res)=>{
    try {

        const userId = req.session.userId
        const user = await User.findOne({_id:userId})
        const orderData = await Order.find({userId:userId}).populate('product.productId')
        console.log(orderData)

        res.render("orders",{user:user,orderData:orderData})
        
    } catch (error) {
        console.log(error.message)
    }
}

// cancel ordre
const cancelOrder = async (req, res)=>{
    try {

        const orderId = req.body.orderId
        const value = req.body.value
        console.log(orderId);
        await Order.updateOne({ orderId: orderId }, { $set: { status: value } }).then(() => {
            res.json({ success: true, value })
        })

    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    getChekoutPage,
    postCheckout,
    viewOrder,
    cancelOrder,
}