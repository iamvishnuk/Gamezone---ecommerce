const Banner = require('../model/banner_data')



const getBannerPage = async(req, res)=>{
    try {

        const bannerData = await Banner.find({})
        console.log(bannerData)
        res.render('banner',{bannerData: bannerData})
        
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async (req, res)=>{
    try {

        console.log(req.body)
        console.log(req.file.filename)


        const banner = new Banner({
            heading: req.body.heading,
            subheading: req.body.subheading,
            image: req.file.filename
        })
        await banner.save()
        res.redirect("/admin/banner")
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    getBannerPage,
    addBanner,
}