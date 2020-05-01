var Student = require("../models/student");
module.exports = {
    isLoggedIn : (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must Sign in first to do that");
        req.session.returnTo = req.originalUrl; 
        res.redirect('/login');
    },

    isAdmin : (req, res, next) => {
        if (req.user.isAdmin) {
            next();
        }
        else {
            req.flash('error', 'This action is not authorised.');
            res.redirect('back');
        }
    },

    isAccountPathValid : (req, res, next) => {
        if (req.user.isAdmin) {
            next();
        } else if ( (typeof req.params.acc_parent_type !== 'undefined') && (typeof req.params.acc_parent_id !== 'undefined') ) {
            if(req.params.acc_parent_type == 'students') {
                Student.findById(req.params.acc_parent_id, (err, student) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "Access denied");
                        res.redirect("back");
                    } else {
                        if(student){
                            next();
                        } else {
                            console.log(student);
                            req.flash("error", "Access denied");
                            res.redirect("back");
                        }
                    }
                });
            } else {
                console.log("Wrong path", req.params.acc_parent_type, req.params.acc_parent_id);
                req.flash("error", "Access denied");
                res.redirect("back");
            }
        } else {
            console.log("Wrong path", req.params.acc_parent_type, req.params.acc_parent_id);
            req.flash("error", "Access denied");
            res.redirect("back");
        }
    }
}