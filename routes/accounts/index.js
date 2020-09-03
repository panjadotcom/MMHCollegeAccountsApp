var express = require("express");
var router = express.Router({mergeParams : true});
var Account = require("../../models/account");
var Student = require("../../models/student");
var Payment = require("../../models/payment");
var middleware = require("../../middleware");
const flash = require("express-flash");
var { isLoggedIn, isAdmin , isAccountPathValid} = middleware;

// INDEX Show all Accounts.
router.get("/", (req, res) => {
    // console.log("INDEX route : /" + req.params.acc_parent_type + "/" + req.params.acc_parent_id);
    Account.find({isStudentAccount : false}, (err, accounts) =>{
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
router.get("/new", isLoggedIn, isAccountPathValid, (req, res) => {
    if(req.params.acc_parent_type && req.params.acc_parent_type === "students"){
        Student.findById(req.params.acc_parent_id, (err, student) => {
            if (err) {
                return res.redirect('back');
            }
            res.render("accounts/new", {
                student : student,
                acc_parent_type : req.params.acc_parent_type,
                acc_parent_id: req.params.acc_parent_id
            });
        });
    }else if (req.user.isAdmin) {
        return res.render("accounts/new", {
            student : undefined,
            acc_parent_type : req.params.acc_parent_type,
            acc_parent_id: req.params.acc_parent_id
        });
    }
});

router.post("/default", isAdmin, (req,res) => {
    let accounts = [
        {
            name : "MAIN-ACCOUNT",
            number : "1234567890",
            description : "Default main account",
            isStudentAccount : false
        },
        {
            name : "MF-ACCOUNT",
            number : "12345",
            description : "Default mf account",
            isStudentAccount : false
        },
        {
            name : "BF-ACCOUNT",
            number : "67890",
            description : "Default bf account",
            isStudentAccount : false
        }
    ];
    Account.insertMany(accounts, {ordered : false}, (err, accounts) => {
        if (err) {
            console.log(err.result);
            req.flash("error",  "New " + err.result.nInserted + " accounts created");
        } else {
            req.flash("error", "New " + accounts.length + " acounts created");
        }
        res.redirect("/accounts");
    });
});

// CREATE new account to be created and updated in DB:
router.post("/", isLoggedIn, isAccountPathValid, (req, res)=>{
    Account.create(req.body.account, (err, account) => {
        if (err) {
            req.flash("error", "New account cannot be created error ");
            console.log(err);
            res.redirect("back");
        }
        else if(req.params.acc_parent_type && req.params.acc_parent_type === "students"){
            Student.findById(req.params.acc_parent_id, (err, student) => {
                if (err) {
                    console.log(err);
                } else if(student) {
                    student.accountId = account._id;
                    student.save();
                    res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id + "/accounts/" + account._id);
                }
                else {
                    res.redirect("/accounts/" + account._id);
                }
            });
        }
        else {
            res.redirect("/accounts/" + account._id);
        }
    });
});

// SHOW route: This will show the details of the account.
router.get("/:account_id", isLoggedIn, (req, res) => {
    Account.findById(req.params.account_id).populate("payments").exec( ( err, account) => {
        if (err) {
            console.log(err);
            req.flash("error", "Account not found ");
            res.redirect("back");
        } else if(account){
            Payment.find({ toAccId : account._id}).populate("fromAccId").populate("toAccId").exec( (err, payments) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("accounts/show", {
                        account : account,
                        payments : payments,
                        acc_parent_type : req.params.acc_parent_type,
                        acc_parent_id: req.params.acc_parent_id
                    });
                }
            });
        } else {
            req.flash("error", "Account deleted!");
            res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id + "/accounts/new");
        }
    });
});

// EDIT route: render edit page with details of the couse_id
router.get("/:account_id/edit", isLoggedIn, (req, res) =>{
    Account.findById(req.params.account_id, (err, account) => {
        if(err) {
            console.log(err);
            req.flash("error", "Account not found");
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
router.put("/:account_id", isLoggedIn, (req, res) =>{
    Account.findByIdAndUpdate(req.params.account_id, req.body.account, (err, account) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update account");
            res.redirect("back");
        }
        else {
            res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id + "/accounts/" + account._id);
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:account_id", isLoggedIn, isAccountPathValid, (req, res) => {
    if(req.params.acc_parent_type == 'students') {
        // Delete accounte for student.
        Account.findByIdAndRemove(req.params.account_id, (err) => {
            if (err) {
                console.log(err);
                req.flash("error", "Could not delete the account");
                res.redirect("back");
            } else {
                Student.findById(req.params.acc_parent_id, (err, student) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "Student not found error");
                        res.redirect("back");
                    } else {
                        student.account = {};
                        student.save();
                        res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id);
                    }
                });
            }
        });
    } else if(req.user.isAdmin) {
        Account.findByIdAndRemove(req.params.account_id, (err) => {
            if (err) {
                console.log(err);
                req.flash("error", "Could not delete the account");
                res.redirect("back");
            } else {
                req.flash("success", "Account deleted successfully.");
                res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id + "/accounts");
            }
        });
    } else {
        req.flash("error", "Default deleting of account is not permitted");
        res.redirect("back");
    }
});

module.exports = router;