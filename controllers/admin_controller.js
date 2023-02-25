const admin = require('../model/admin_data');
const Product = require('../model/products_data');
const Category = require('../model/category_data');
const Users = require('../model/user_data');
const Orders = require('../model/orders_data')
const moment = require('moment')

// var errorMessage
// var successMessage



// login login page
const adminlogin = async (req, res) => {
    try {
        res.render('admin_login')
    } catch (error) {
        console.log(error.message);
    }
}


// admin dashboard 
const adminVerify = async (req, res) => {
    try {

        const username = req.body.username
        const password = req.body.password

        console.log(req.body);

        const adminData = await admin.findOne({ username: username, password: password })
        console.log(adminData)
        if (adminData) {
            req.session.admin_id = adminData._id
            res.redirect('/admin/adminhome')
        } else {

            res.render('admin_login', { errorMessage: "username and password is wrong" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const adminHome = async (req, res) => {
    try {
        res.render('adminhome')
    } catch (error) {
        console.log(error.message)
    }
}


//==================================== CATEGORY ===============================
const viewCategory = async (req, res) => {
    try {

        const categoryData = await Category.find({})
        // console.log(categoryData)

        res.render("category", { categoryData: categoryData, moment: moment })
    } catch (error) {
        console.log(error.message);
    }
}

//------------add category page get methode---------- 
const addCategory = async (req, res) => {
    try {
        res.render("addcategory")
    } catch (error) {
        console.log(error.message);
    }
}
// insert category post function
const insertCategory = async (req, res) => {
    try {

        const cname = req.body.categoryName
        const reqex = new RegExp(cname, 'i')
        const findCategory = await Category.find({ categoryName: reqex })
        const dataLength = findCategory.length

        if (dataLength === 1) {

            console.log("data already exists");
            res.render("addcategory", { errorMessage: "Category already exist ....!" })

        } else {

            const category = new Category({
                categoryName: req.body.categoryName,
                description: req.body.description,
                categoryImage: req.file.filename
            })
            const categoryData = await category.save();
            if (categoryData) {

                res.redirect('category')
            }
            else {
                console.log("category not created");
            }

        }

    } catch (error) {
        console.log(error.message);
    }

}

// category delete function
const deleteCategory = async (req, res) => {
    try {

        const categoryId = req.params.id
        await Category.deleteOne({ _id: categoryId })
        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message);
    }
}

// edit category get function
const getEditCategory = async (req, res) => {
    try {

        const catId = req.params.id
        const categoryData = await Category.find({ _id: catId })
        res.render('editcategory', { categoryData: categoryData })

    } catch (error) {
        console.log(error.message);
    }
}

// edit category post function
const postEditCategory = async (req, res) => {
    try {

        console.log(" post edit category function called");
        const categoryId = req.params.id
        console.log(categoryId);

        const categoryUpdate = await Category.updateOne(
            { _id: categoryId },
            {
                categoryName: req.body.categoryName,
                description: req.body.description
            }
        ).then((result) => {
            res.redirect("/admin/category")
        })


    } catch (error) {
        console.log(error.message)
    }
}


// =========== USER =============================
// all users table
const allUsers = async (req, res) => {
    try {

        const userDetails = await Users.find({})
        res.render("all_users", { userDetails: userDetails, moment: moment })

    } catch (error) {
        console.log(error.message);
    }
}

// block user
const blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(userId);
        await Users.updateOne({ _id: req.params.id }, { blocked: true });
        res.redirect('/admin/allusers');
    } catch (error) {
        console.log(error.message);
    }
};

// unblock user
const unblockUser = async (req, res) => {
    try {

        const userId = req.params.id;
        console.log(userId);
        await Users.updateOne({ _id: req.params.id }, { blocked: false });
        res.redirect('/admin/allusers');

    } catch (error) {
        console.log(error.message);
    }
}

// view all order table
const getAllOrder = async (req, res) => {
    try {

        const orderData = await Orders.find({}).populate('product.productId')
        console.log(orderData)

        res.render("vieworders", { orderData: orderData })

    } catch (error) {
        console.log(error.messge);
    }
}

const changeStatus = async (req, res) => {
    try {

        const orderId = req.body.orderId
        const value = req.body.value
        console.log(orderId);
        await Orders.updateOne({ orderId: orderId }, { $set: { status: value } }).then(() => {
            res.json({ success: true, value })
        })

    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    adminlogin,
    adminVerify,
    adminHome,
    viewCategory,
    addCategory,
    insertCategory,
    deleteCategory,
    allUsers,
    blockUser,
    unblockUser,
    getEditCategory,
    postEditCategory,
    getAllOrder,
    changeStatus,
}