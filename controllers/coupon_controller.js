const Coupon = require('../model/coupon_data')

const getCouponPage = async (req, res)=>{
    try {

        res.render("viewcoupon")
        
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

module.exports = {
    getCouponPage,
    getAddCouponPage,
}