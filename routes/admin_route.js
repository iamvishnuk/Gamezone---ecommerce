const express = require('express')
const admin_route = express()
const adminController = require('../controllers/admin_controller')
const productController = require('../controllers/product_controller')
const path = require('path')
const multer = require("multer");
const adminAuth = require('../middlewares/admin_auth')

//multer for adding multiple image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/product_images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage })



admin_route.set('view engine', 'ejs')
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

// edit product post method -------------------------------------------------------------------------------------------
admin_route.post('/editProduct/:id', upload.array('productImage', 3), productController.editProduct)

// admin view category
admin_route.get('/category', adminAuth.isLogin, adminController.viewCategory)

// category get method
admin_route.get("/addcategory", adminAuth.isLogin, adminController.addCategory)

// add category post method------------------------------------------------------------------------------------------
admin_route.post('/addcategory', adminController.insertCategory)

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





// admin logout
admin_route.get('/adminLogout',adminAuth.adminLogout)




module.exports = admin_route