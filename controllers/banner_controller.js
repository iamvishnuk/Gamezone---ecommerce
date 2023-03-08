const Banner = require('../model/banner_data')
const fs = require('fs')
const path = require('path')



const getBannerPage = async(req, res, next)=>{
    try {

        const bannerData = await Banner.find({})
        res.render('banner',{bannerData: bannerData})
        
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addBanner = async (req, res, next)=>{
    try {

        const banner = new Banner({
            heading: req.body.heading,
            subheading: req.body.subheading,
            image: req.file.filename
        })
        await banner.save()
        res.redirect("/admin/banner")
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const deleteBanner = async (req, res, next)=>{
    try {

        const bannerId = req.params.id
        const bannerData = await Banner.findOne({_id: bannerId})

        fs.unlink(path.join(__dirname,'../public/product_images',bannerData.image),()=>{})
        await Banner.deleteOne({_id: bannerId}).then(()=>{
            res.json({success: true})
        })
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

module.exports = {
    getBannerPage,
    addBanner,
    deleteBanner,
}