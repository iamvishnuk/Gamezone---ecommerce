
// while admin login
const isLogin = async(req, res, next)=>{
    try {
        if(req.session.admin_id){
            console.log("admin login");
        }
        else{
            res.redirect('/admin')
        }
        next()
    }catch (error) {
        console.log(error.message);
    }
}

// admin entering after closing the tab
const isLogout = async(req, res, next)=>{
    try {
        if(req.session.admin_id){
            console.log("admin entering after closing the tab");
            res.redirect('/admin/adminhome')
        }
        next()
    } catch (error) {

        console.log(error.message);
        
    }
}

const adminLogout = async (req, res)=>{
    try {
        req.session.admin_id = null
        res.redirect("/admin")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    isLogin,
    isLogout,
    adminLogout
}