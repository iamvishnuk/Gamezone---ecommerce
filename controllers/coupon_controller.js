const Coupon = require('../model/coupon_data')
const moment = require('moment')
const { request, response } = require('express')

const getCouponPage = async (req, res, next) => {
    try {

        const couponData = await Coupon.find({})
        res.render("viewcoupon", { couponData: couponData, moment: moment })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}


// get add coupon page
const getAddCouponPage = async (req, res, next) => {
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// add coupon post method 
const postAddCoupon = async (req, res, next) => {
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
        next(error)
    }
}

// apply coupon by user
const applyCoupon = async (req, res, next) => {
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
        next(error)
    }
}

// edit coupon
const editCoupon = async (req, res, next)=>{
    try {

        const couponId = req.params.id
        const couponData = await Coupon.findById(couponId)
        console.log(couponData)
        res.render('editcoupon',{couponData:couponData})
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// post edit coupon
const postEditCoupon = async (req, res, next)=>{
    try {

        const couponId = req.params.id
        const couponData = req.body
        await Coupon.findByIdAndUpdate(couponId, couponData)
        res.redirect('/admin/viewcoupon')
        
    } catch (error) {
        console.log(error)
        next(error)
    }
}


// delete coupon 
const deleteCoupon = async (req, res, next) =>{
    try {
        
        console.log(req.params.id)
        const couponId = req.params.id
        await Coupon.deleteOne({_id: couponId})
        res.redirect("/admin/viewcoupon")
        
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}







module.exports = {
    getCouponPage,
    getAddCouponPage,
    postAddCoupon,
    applyCoupon,
    editCoupon,
    postEditCoupon,
    deleteCoupon,
}