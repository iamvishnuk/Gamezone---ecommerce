const Coupon = require('../model/coupon_data')
const moment = require('moment')

const getCouponPage = async (req, res)=>{
    try {

        const couponData = await Coupon.find({})
        console.log(couponData)

        res.render("viewcoupon",{couponData: couponData,moment:moment})  
    } catch (error) {
        console.log(error.message)
    }
}

// get add coupon page
const getAddCouponPage = async (req, res)=>{
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
    }
}

// add coupon post method 
const postAddCoupon = async (req, res)=>{
    try {

        console.log(req.body);
        const coupon = new Coupon({
            code: req.body.code,
            percentageOff: parseInt(req.body.percentageOff),
            maxDiscount: parseInt(req.body.maxDiscount),
            expiryDate: req.body.expiryDate,
            minimumPurchseAmount: parseInt(req.body.minimumPurchseAmount)
        })
        await coupon.save().then(()=>{
            res.redirect("/admin/viewcoupon")
        }).catch((err)=>{
            console.log(err);
        })
        
        
    } catch (error) {
        console.log(error.message);
    }
}







module.exports = {
    getCouponPage,
    getAddCouponPage,
    postAddCoupon,
}