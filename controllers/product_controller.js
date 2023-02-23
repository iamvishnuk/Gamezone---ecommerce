const Product = require('../model/products_data')
const Category = require('../model/category_data')


//================= PRODUCTS =================
// product page get function
const viewProducts = async (req, res) => {
    try {

        const allProducts = await Product.find({}).populate("category")
        res.render("view_products", { allProducts: allProducts })

    } catch (error) {
        console.log(error.message);
    }
}

//admin add products get function
const addProducts = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render("addproducts", { categoryData: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

// admin insert poducts post methode function
const insertProducts = async (req, res) => {
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
    }
}

// admin delete product function
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        await Product.deleteOne({ _id: productId })
        res.redirect('/admin/viewproducts')
    } catch (error) {
        console.log(error.message);
    }
}

// product unlist
const unlistProduct = async (req, res) => {
    try {

        const proId = req.params.id
        await Product.updateOne({ _id: proId }, { list: false })
        res.redirect('/admin/viewproducts')

    } catch (error) {
        console.log(error.message)
    }
}

// product list 
const listProduct = async (req, res) => {
    try {

        const proId = req.params.id
        await Product.updateOne({ _id: proId }, { list: true })
        res.redirect('/admin/viewproducts')

    } catch (error) {
        console.log(error.message);
    }
}

// edit product 
const editProductPage = async (req, res) => {
    try {

        const proId = req.params.id

        const categoryData = await Category.find()
        const productData = await Product.findOne({ _id: proId }).populate('category')

        console.log(productData.category.categoryName)

        // const categoryName = await Category.findOne({categoryName: productData.category.categoryName})
        // console.log(categoryName+"hiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    
        res.render('edit_product', { categoryData: categoryData, productData: productData  })

    } catch (error) {
        console.log(error.message)
    }
}
const editProduct = async (req, res) => {
    try {

        const proId = req.params.id

        uploadedImage = req.files
        const images = []
        uploadedImage.forEach(element => {
            images.push(element.filename)
        });

        const productUpdate = await Product.updateOne(
            { _id: proId },
            {
                product_name: req.body.productName,
                brand: req.body.brand,
                category: req.body.category,
                price: req.body.price,
                stock: req.body.stock,
                images: images,
                description: req.body.description
            }
        )


        res.redirect('/admin/viewproducts')

    } catch (error) {

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
    editProduct
}