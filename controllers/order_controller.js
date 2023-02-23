const User = require("../model/user_data")
const Product = require("../model/products_data")
const Category = require("../model/category_data")

// get chekout page
const getChekoutPage = async (req, res)=>{
    try {

        if(req.session.userId){
            
            res.render("checkoutoutpage")

        }
        
    } catch (error) {
        console.log(error.message)
    }
}