module.exports = {
    isLoggedIn : (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must Sign in first to do that")
        res.redirect("back");
    },

    isAdmin : (req, res, next) => {
        if (req.user.isAdmin) {
            next()
        }
        else {
            req.flash('error', 'This site is now read only thanks to spam and trolls.');
            res.redirect('back');
        }
    }
}