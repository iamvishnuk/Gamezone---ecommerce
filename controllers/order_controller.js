const User = require("../model/user_data")
const Product = require("../model/products_data")
const Category = require("../model/category_data")
const Order = require("../model/orders_data")

// get chekout page
const getChekoutPage = async (req, res) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            const user = await User.findOne({ _id: userId })
            const address = user.addresses
            const cartItem = await User.findOne({ _id: userId }).populate('cart.productId')

            // console.log(cartItem)

            res.render("checkoutpage", { address: address, user: user, cartItem: cartItem })

        } else {
            res.redirect("/userlogin")
        }

    } catch (error) {
        console.log(error.message)
    }
}

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
                paymentType: orderData.paymentMethod

            })

            const ordered = await orders.save()

            await User.updateOne(
                { userId: userId },
                { $pull: { cart: { productId: { $in: productIds } } } }
            )

            res.render("orderconfirmpage")

        }

    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    getChekoutPage,
    postCheckout,
}