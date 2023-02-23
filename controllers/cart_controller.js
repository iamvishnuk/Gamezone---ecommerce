const Product = require("../model/products_data")
const Users = require("../model/user_data")
const Category = require("../model/category_data")



// get cart
const getcart = async (req, res) => {
    try {
        if (req.session.userId) {

            const userId = req.session.userId
            const user = await Users.findOne({ _id: userId })

            const cartItems = await Users.findOne({ _id: user._id },).populate('cart.productId')

            const updatedCart = await Users.findOne({ _id: user._id }, { cart: 1 })

            const cartTotal = updatedCart.cart.reduce(
                (total, item) => total + item.productTotalPrice, 0
            )

            const cartTotalPrice = await Users.updateOne(
                { _id: user._id },
                { cartTotalPrice: cartTotal }
            )

            res.render('cart', { cartItems: cartItems, user: user, total: cartTotal })

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

        if (req.session.userId) {

            const userId = req.session.userId
            const proId = req.params.id
            const user = await Users.findOne({ _id: userId })

            const productData = await Product.findOne({ _id: proId })

            const cartCheck = await Users.findOne({ _id: user._id, 'cart.productId': proId }, { 'productId.$': 1 })

            if (cartCheck) {
                res.redirect('/cart')
            } else {

                const cartUpdate = await Users.updateOne({ _id: user._id }, { $push: { cart: { productId: proId, productTotalPrice: productData.price } } })

                // cart total price ==================================================
                const updatedCart = await Users.findOne({ _id: user._id }, { cart: 1 })

                const cartTotal = updatedCart.cart.reduce(
                    (total, item) => total + item.productTotalPrice, 0
                )

                const cartTotalPrice = await Users.updateOne(
                    { _id: user._id },
                    { cartTotalPrice: cartTotal }
                )
                //end of cart total price --------------------------------------------

                const cartData = await Users.findOne({ _id: user._id },).populate('cart.productId').lean().exec()

                res.render('cart', { cartItems: cartData, user: user, total: cartTotal })
            }


        } else {
            res.redirect('/userlogin')
        }

    } catch (error) {

    }
}

// cart quantity increment function
const incrementQuantity = async (req, res) => {
    try {

        if (req.session.userId) {

            const userId = req.session.userId
            const proId = req.body.productId
            const count = req.body.count
            const pPrice = req.body.pPrice

            const user = await Users.findOne({ _id: userId })

            const increment = await Users.updateOne(
                { _id: user._id, "cart.productId": proId },
                { $inc: { 'cart.$.quantity': count } }
            )

            //product total price 
            const cartItem = await Users.findOne({ _id: user._id, "cart.productId": proId }, { "cart.$": 1 })
            const productTotal = pPrice * cartItem.cart[0].quantity

            const pTotal = await Users.updateOne(
                { _id: user._id, "cart.productId": proId },
                { $set: { 'cart.$.productTotalPrice': productTotal } }
            )

            // cart total---------------------------------------------------------
            const updatedCart = await Users.findOne({ _id: user._id }, { cart: 1 })

            const cartTotal = updatedCart.cart.reduce(
                (total, item) => total + item.productTotalPrice, 0
            )
            console.log(cartTotal);

            const cartTotalPrice = await Users.updateOne(
                { _id: user._id },
                { cartTotalPrice: cartTotal }
            )

            // end of cart total price ------------------------------------------------ 

            res.json({ success: true, productTotal, cartTotal })

        }

    } catch (error) {
        console.log(error.message)
    }
}

// cart item remove function
const removeCart = async (req, res) => {
    try {
        const proId = req.params.id
        const userId = req.session.userId
        const user = await Users.findOne({ _id: userId })

        console.log(proId);

        const removeItem = await Users.updateOne({ _id: user._id }, { $pull: { cart: { productId: proId } } }).then((response) => {
            res.redirect("/cart")
        })

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    getcart,
    addToCart,
    incrementQuantity,
    removeCart,
}