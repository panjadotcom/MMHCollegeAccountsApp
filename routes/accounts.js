var express = require("express");
var router = express.Router({mergeParams : true});
var Account = require("../models/account");
var Student = require("../models/student");
var middleware = require("../middleware");
var { isLoggedIn, isAdmin , isAccountPathValid} = middleware;

// INDEX Show all Accounts.
router.get("/", (req, res) => {
    // console.log("INDEX route : /" + req.params.acc_parent_type + "/" + req.params.acc_parent_id);
    Account.find({}, (err, accounts) =>{
        if (err) {
            console.log(err);
        } else {
            res.render("accounts/index", {
                accounts : accounts,
                page: 'accounts',
                acc_parent_type : req.params.acc_parent_type,
                acc_parent_id: req.params.acc_parent_id
            });
        }
    });
});

// NEW render new page to create new account
router.get("/new", isAccountPathValid, isLoggedIn, (req, res) => {
    res.render("accounts/new", {
        acc_parent_type : req.params.acc_parent_type,
        acc_parent_id: req.params.acc_parent_id
    });
});

// CREATE new account to be created and updated in DB:
router.post("/", isAccountPathValid, isLoggedIn, (req, res)=>{
    Account.create(req.body.account, (err, account) => {
        if (err) {
            req.flash("error", "New account cannot be created error : " + err.message);
            console.log(err);
            res.redirect("back");
        }
        else {
            Student.findById(req.params.acc_parent_id, (err, student) => {
                if (err) {
                    console.log(err);
                } else {
                    student.account.id = account._id;
                    student.account.name = account.name;
                    student.save();
                    res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id);
                }
            });
        }
        
    });
});

// SHOW route: This will show the details of the account.
router.get("/:account_id", (req, res) => {
    Account.findById(req.params.account_id, (err, account) => {
        if (err) {
            console.log(err);
            req.flash("error", "Account not found " + err.message );
            res.redirect("back");
        } else {
            res.render("accounts/show", {
                account : account,
                acc_parent_type : req.params.acc_parent_type,
                acc_parent_id: req.params.acc_parent_id
            });
        }
    });
});

// EDIT route: render edit page with details of the couse_id
router.get("/:account_id/edit", isAccountPathValid, isLoggedIn, (req, res) =>{
    Account.findById(req.params.account_id, (err, account) => {
        if(err) {
            console.log(err);
            req.flash("error", "Account not found " + err.message);
            res.redirect('back');
        }
        else {
            res.render("accounts/edit", {
                account : account,
                acc_parent_type : req.params.acc_parent_type,
                acc_parent_id: req.params.acc_parent_id
            });
        }
    });
});

// UPDATE route: this will update the details 
router.put("/:account_id", isAccountPathValid, isLoggedIn, (req, res) =>{
    Account.findByIdAndUpdate(req.params.account_id, req.body.account, (err, account) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update account : " + err.message);
            res.redirect("back");
        }
        else {
            res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id + "/accounts/" + account._id);
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:account_id", isAccountPathValid, isLoggedIn, (req, res) => {
    if(req.params.acc_parent_type == 'students') {
        // Delete accounte for student.
        Account.findByIdAndRemove(req.params.account_id, (err) => {
            if (err) {
                console.log(err);
                req.flash("error", "Could not delete the account : " + err.message);
                res.redirect("back");
            } else {
                Student.findById(req.params.acc_parent_id, (err, student) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "Student not found error : " + err.message);
                        res.redirect("back");
                    } else {
                        student.account = {};
                        student.save();
                        res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id);
                    }
                });
            }
        });
    } else if(req.params.acc_parent_type == 'courses') {
        req.flash("error", "Deleting account for course is not permitted.")
        res.redirect("/courses");
    } else {
        req.flash("error", "Default deleting of account is not permitted");
        res.redirect("back");
    }
});

module.exports = router;