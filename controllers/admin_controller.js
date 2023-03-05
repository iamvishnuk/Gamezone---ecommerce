const admin = require('../model/admin_data');
const Product = require('../model/products_data');
const Category = require('../model/category_data');
const Users = require('../model/user_data');
const Orders = require('../model/orders_data')
const moment = require('moment');
const { findById } = require('../model/admin_data');

// var errorMessage
// var successMessage



// login login page
const adminlogin = async (req, res, next) => {
    try {
        res.render('admin_login')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}


// admin dashboard 
const adminVerify = async (req, res,next) => {
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
        next(error)
    }
}

const adminHome = async (req, res,next) => {
    try {

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Get date one week ago
        const customer = await Users.find({ date: { $gte: oneWeekAgo } }).count() // Get all orders from the last week
        let revenue = 0;
        let sales = 0;
        // let customer = 0;

        const totalOrder = await Orders.aggregate([
            {
                $match: {
                    "date": { $gte: oneWeekAgo }
                }
            }
        ])
        for (let i = 0; i < totalOrder.length; i++) {
            revenue = revenue + totalOrder[i].total
        }

        // total sales
        const totalSales = await Orders.aggregate([
            {
                $match: {
                    "date": { $gte: oneWeekAgo }
                }
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.productId",
                    totalQuantity: { $sum: "$product.quantity" }
                }
            },
            {
                $project: {
                    productId: "$_id",
                    totalQuantity: 1,
                    _id: 0
                }
            }
        ])
        for (let i = 0; i < totalSales.length; i++) {
            sales = sales + totalSales[i].totalQuantity
        }
        const outputArray = await Promise.all(totalSales.map(async (item) => {
            const product = await Product.findById(item.productId)
            return product.brand
        }));

        console.log(outputArray)

        res.render('adminhome', { revenue, sales, customer, outputArray })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}


//==================================== CATEGORY ===============================
const viewCategory = async (req, res, next) => {
    try {

        const categoryData = await Category.find({})
        // console.log(categoryData)

        res.render("category", { categoryData: categoryData, moment: moment })
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

//------------add category page get methode---------- 
const addCategory = async (req, res, next) => {
    try {
        res.render("addcategory")
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
// insert category post function
const insertCategory = async (req, res, next) => {
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
        next(error)
    }

}

// category delete function
const deleteCategory = async (req, res, next) => {
    try {

        const categoryId = req.params.id
        await Category.deleteOne({ _id: categoryId })
        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// edit category get function
const getEditCategory = async (req, res, next) => {
    try {

        const catId = req.params.id
        const categoryData = await Category.find({ _id: catId })
        res.render('editcategory', { categoryData: categoryData })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// edit category post function
const postEditCategory = async (req, res, next) => {
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
        next(error)
    }
}


// =========== USER =============================
// all users table
const allUsers = async (req, res, next) => {
    try {

        const userDetails = await Users.find({})
        res.render("all_users", { userDetails: userDetails, moment: moment })

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// block user
const blockUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        console.log(userId);
        await Users.updateOne({ _id: req.params.id }, { blocked: true });
        res.redirect('/admin/allusers');
    } catch (error) {
        console.log(error.message);
        next(error)
    }
};

// unblock user
const unblockUser = async (req, res, next) => {
    try {

        const userId = req.params.id;
        console.log(userId);
        await Users.updateOne({ _id: req.params.id }, { blocked: false });
        res.redirect('/admin/allusers');

    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

// view all order table
const getAllOrder = async (req, res, next) => {
    try {

        const orderData = await Orders.find({}).populate('product.productId').sort({ date: -1 })
        console.log(orderData)

        res.render("vieworders", { orderData: orderData })

    } catch (error) {
        console.log(error.messge);
        next(error)
    }
}

const changeStatus = async (req, res, next) => {
    try {

        const orderId = req.body.orderId
        const value = req.body.value
        console.log(orderId);
        await Orders.updateOne({ orderId: orderId }, { $set: { status: value } }).then(() => {
            res.json({ success: true, value })
        })

    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

// sales report 
const saleReport = async (req, res, next) => {
    try {


        const ordersData = await Orders.find().populate({
            path: "product.productId",
            select: "product_name price",
        });

        // Create a new object to store total sales for each product by month
        const salesByMonthAndProduct = {};

        // Iterate over each order and update salesByMonthAndProduct with the total sales for each product by month
        ordersData.forEach((order) => {
            const orderDate = new Date(order.date); // for getting one month data
            const month = orderDate.toLocaleString("default", { month: "long" });

            order.product.forEach((product) => {
                const productName = product.productId.product_name;
                const productSalesTotal = product.quantity * product.productId.price;

                if (!(month in salesByMonthAndProduct)) {
                    salesByMonthAndProduct[month] = {};
                }

                if (productName in salesByMonthAndProduct[month]) {
                    salesByMonthAndProduct[month][productName].quantitySold += product.quantity;
                    salesByMonthAndProduct[month][productName].totalSales += productSalesTotal;
                } else {
                    salesByMonthAndProduct[month][productName] = {
                        quantitySold: product.quantity,
                        totalSales: productSalesTotal,
                    };
                }
            });
        });

        res.render("salesreport", {
            salesByMonthAndProduct,
        });


    } catch (error) {
        console.log(error.message);
        next(error)
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
    saleReport,
}