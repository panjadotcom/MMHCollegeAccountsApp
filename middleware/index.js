var Student = require("../models/student");
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
            next();
        }
        else {
            req.flash('error', 'This site is now read only thanks to spam and trolls.');
            res.redirect('back');
        }
    },

    isAccountPathValid : (req, res, next) => {
        if ( (typeof req.params.acc_parent_type !== 'undefined') && (typeof req.params.acc_parent_id !== 'undefined') ) {
            if(req.params.acc_parent_type == 'students') {
                Student.findById(req.params.acc_parent_id, (err, student) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "Student not found error : " + err.message);
                        res.redirect("back");
                    } else {
                        if(student){
                            next();
                        } else {
                            console.log(student);
                            req.flash("error", "Student not found :");
                            res.redirect("back");
                        }
                    }
                });
            } else {
                console.log("Wrong path", eq.params.acc_parent_type, req.params.acc_parent_id);
                req.flash("error", "Wrong path to access account");
                res.redirect("back");
            }
        } else {
            console.log("Wrong path", req.params.acc_parent_type, req.params.acc_parent_id);
            req.flash("error", "Wrong path to access account");
            res.redirect("back");
        }
    }
}