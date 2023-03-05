const express = require('express')
const admin_route = express()
const upload = require('../middlewares/multer')
const adminController = require('../controllers/admin_controller')
const productController = require('../controllers/product_controller')
const adminAuth = require('../middlewares/admin_auth')
const couponController = require('../controllers/coupon_controller')
const bannerController = require('../controllers/banner_controller')

// admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')



//admin login page
admin_route.get('/', adminAuth.isLogout, adminController.adminlogin)

//admin login post method
admin_route.post('/', adminController.adminVerify)

//admin home page get method
admin_route.get('/adminhome', adminAuth.isLogin, adminController.adminHome)

//view products page get method
admin_route.get('/viewproducts', adminAuth.isLogin, productController.viewProducts)

//admin add products page get method
admin_route.get('/addproducts', adminAuth.isLogin, productController.addProducts)

// admin insert products post method
admin_route.post('/addproducts', upload.array('productImage', 3), productController.insertProducts)

//admin delete products
admin_route.get('/deleteProduct/:id', productController.deleteProduct)

// list products
admin_route.get('/listproduct/:id', productController.listProduct)

// unlist products
admin_route.get('/unlistproduct/:id', productController.unlistProduct)

// edit product get method 
admin_route.get('/editProductPage/:id', adminAuth.isLogin, productController.editProductPage)

// edit product post method 
admin_route.post('/editProduct/:id', productController.editProduct)

// edit image
admin_route.post("/editImage/:id",upload.array('productImage',3),productController.editImage)

// delete image
admin_route.get("/delete-image/:imgId/:proId",productController.deleteImage)

// admin view category
admin_route.get('/category', adminAuth.isLogin, adminController.viewCategory)

// category get method
admin_route.get("/addcategory", adminAuth.isLogin, adminController.addCategory)

// add category post method
admin_route.post('/addcategory', upload.single("categoryImage"), adminController.insertCategory)

// delete category
admin_route.get("/delete_category/:id", adminController.deleteCategory)

// edit category get method
admin_route.get('/editcategory/:id', adminController.getEditCategory)

// edit category post method
admin_route.post('/posteditcategory/:id',adminController.postEditCategory)

// all users page get method------------------------------------------------
admin_route.get("/allusers",adminAuth.isLogin,adminController.allUsers)

//admin block user
admin_route.get('/block/:id',adminController.blockUser)

// admin unblock user
admin_route.get('/unblock/:id',adminController.unblockUser)

// view orders -------------------------------------------------------------
admin_route.get("/vieweorders", adminAuth.isLogin,adminController.getAllOrder)

// change order status
admin_route.post('/change-status',adminController.changeStatus)

// get coupon page -----------------------------------------------------------
admin_route.get('/viewcoupon', adminAuth.isLogin,couponController.getCouponPage)

// get add coupon page
admin_route.get('/addcoupon', adminAuth.isLogin,couponController.getAddCouponPage)

// post add coupon 
admin_route.post('/add-coupon',couponController.postAddCoupon)

// delete coupon 
admin_route.get("/delete-coupon/:id",couponController.deleteCoupon)

//banner
admin_route.get("/banner",bannerController.getBannerPage)

//add banner 
admin_route.post('/add-banner', upload.single("bannerImage"),bannerController.addBanner)

// delete banner
admin_route.get("/delete_banner/:id",bannerController.deleteBanner)

// sales report 
admin_route.get("/salesreport",adminController.saleReport)




// admin logout
admin_route.get('/adminLogout',adminAuth.adminLogout)




module.exports = admin_route