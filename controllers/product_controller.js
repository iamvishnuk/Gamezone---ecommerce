const Product = require('../model/products_data')
const Category = require('../model/category_data')
const fs = require('fs')
const path = require('path')


//================= PRODUCTS =================
// product page get function
const viewProducts = async (req, res, next) => {
    try {

        const allProducts = await Product.find({}).populate("category")
        res.render("view_products", { allProducts: allProducts })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

//admin add products get function
const addProducts = async (req, res, next) => {
    try {
        const categoryData = await Category.find({})
        res.render("addproducts", { categoryData: categoryData })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// admin insert poducts post methode function
const insertProducts = async (req, res, next) => {
    try {


        uploadedImage = req.files
        const images = []
        uploadedImage.forEach(element => {
            images.push(element.filename)
        });

        const products = new Product({
            product_name: req.body.productName,
            brand: req.body.brand,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock,
            images: images,
            description: req.body.description
        })

        const productData = await products.save()

        if (productData) {
            res.redirect("/admin/addproducts")
        } else {
            res.render("add_products", { addProductError: "product add failed" })
        }



    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// admin delete product function
const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id
        await Product.deleteOne({ _id: productId })
        res.redirect('/admin/viewproducts')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// product unlist
const unlistProduct = async (req, res, next) => {
    try {

        const proId = req.params.id
        await Product.updateOne({ _id: proId }, { list: false })
        res.redirect('/admin/viewproducts')

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// product list 
const listProduct = async (req, res, next) => {
    try {

        const proId = req.params.id
        await Product.updateOne({ _id: proId }, { list: true })
        res.redirect('/admin/viewproducts')

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// edit product 
const editProductPage = async (req, res, next) => {
    try {

        const proId = req.params.id

        const categoryData = await Category.find()
        const productData = await Product.findOne({ _id: proId }).populate('category')
    
        res.render('edit_product', { categoryData: categoryData, productData: productData  })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const editProduct = async (req, res, next) => {
    try {

        const proId = req.params.id
        console.log(req.body)

        const productUpdate = await Product.updateOne(
            { _id: proId },
            {
                product_name: req.body.productName,
                brand: req.body.brand,
                category: req.body.category,
                price: req.body.price,
                stock: req.body.stock,
                description: req.body.description
            }
        )

        res.redirect('/admin/viewproducts')

    } catch (error) {
        console.log(error);
        next(error)

    }
}

const editImage = async (req, res, next)=>{
    try {

        const proId = req.params.id;
        uploadedImage = req.files
        const images = []

        uploadedImage.forEach(element => {
            images.push(element.filename)
        });

        await Product.updateOne({_id:proId},{$push:{images:images}}).then(()=>{
            res.redirect("/admin/editProductPage/"+proId)
        })
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}
const deleteImage = async (req, res, next)=>{
    try {

        const imageId = req.params.imgId
        const proId = req.params.proId
        fs.unlink(path.join(__dirname,'../public/product_images',imageId),()=>{})
        await Product.updateOne({_id:proId},{$pull:{images:imageId}});

        res.redirect("/admin/editProductPage/"+proId)
        
    } catch (error) {
        console.log(error.message);
        next(error)
    }

}

module.exports = {
    viewProducts,
    addProducts,
    insertProducts,
    deleteProduct,
    unlistProduct,
    listProduct,
    editProductPage,
    editProduct,
    editImage,
    deleteImage,
}