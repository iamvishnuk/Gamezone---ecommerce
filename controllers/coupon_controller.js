const Coupon = require('../model/coupon_data')
const moment = require('moment')
const { request, response } = require('express')

const getCouponPage = async (req, res) => {
    try {

        const couponData = await Coupon.find({})
        res.render("viewcoupon", { couponData: couponData, moment: moment })

    } catch (error) {
        console.log(error.message)
    }
}


// get add coupon page
const getAddCouponPage = async (req, res) => {
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
    }
}

// add coupon post method 
const postAddCoupon = async (req, res) => {
    try {

        const coupon = new Coupon({
            code: req.body.code,
            percentageOff: parseInt(req.body.percentageOff),
            maxDiscount: parseInt(req.body.maxDiscount),
            expiryDate: req.body.expiryDate,
            minimumPurchseAmount: parseInt(req.body.minimumPurchseAmount)
        })
        await coupon.save().then(() => {
            res.redirect("/admin/viewcoupon")
        }).catch((err) => {
            console.log(err);
        })


    } catch (error) {
        console.log(error.message);
    }
}

// apply coupon by user
const applyCoupon = async (req, res) => {
    try {

        const cartTotal = req.body.cartTotal
        const couponCode = req.body.couponCode
        const user = req.session.userId
        const today = Date.now()

        const coupon = await Coupon.findOne({ code: couponCode })
        const couponUsedUser = await Coupon.findOne({code: couponCode,usersUsed:{$in:[ user]}})
        
        if(couponUsedUser){
            res.json({userUsed: true})
        }else{

            if (today < coupon.expiryDate) {

                if (cartTotal >= coupon.minimumPurchseAmount) {

                    const percentage = (cartTotal * coupon.percentageOff) / 100
                    console.log(percentage)

                    if (percentage > coupon.maxDiscount) {

                        const total = cartTotal - coupon.maxDiscount
                        console.log(total)
                        res.json({ discountedAmount: coupon.maxDiscount, total })

                    } else {

                        const total = cartTotal - percentage
                        console.log(total)
                        res.json({ discountedAmount: percentage, total })

                    }
                    
                } else {

                    res.json({ minmumAmountFail: true })

                }

            } else {

                res.json({ dateFail: true })

            }

        }

        

    } catch (error) {
        console.log(error.message)
    }
}

// delete coupon 
const deleteCoupon = async (req, res) =>{
    try {
        
        console.log(req.params.id)
        const couponId = req.params.id
        await Coupon.deleteOne({_id: couponId})
        res.redirect("/admin/viewcoupon")
        
    } catch (error) {
        console.log(error.message);
    }
}







module.exports = {
    getCouponPage,
    getAddCouponPage,
    postAddCoupon,
    applyCoupon,
    deleteCoupon,
}