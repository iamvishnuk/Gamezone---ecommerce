
// while admin login
const isLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {
            console.log("user logged in");
        }
        else {
            res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

// admin entering after closing the tab
const isLogout = async (req, res, next) => {
    try {
        if (req.session.userId) {
            console.log("user entering after closing the tab");
            res.redirect('/')
        }
        next()
    } catch (error) {

        console.log(error.message);

    }
}

const userLogout = async (req, res) => {
    try {
        req.session.userId = null
        res.redirect("/")
        console.log("session destoryed");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    userLogout
}