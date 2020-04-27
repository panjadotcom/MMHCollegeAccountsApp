var express = require("express");
var router = express.Router();
var Account = require("../models/account");
var middleware = require("../middleware");
var { isLoggedIn, isAdmin } = middleware;

// INDEX Show all Accounts.
router.get("/", (req, res) => {
    Account.find({}, (err, accounts) =>{
        if (err) {
            console.log(err);
        } else {
            res.render("accounts/index", { accounts : accounts , page: 'accounts'});
        }
    });
});

// NEW render new page to create new account
router.get("/new", isLoggedIn, (req, res) => {
    res.render("accounts/new");
});

// CREATE new account to be created and updated in DB:
router.post("/", isLoggedIn, (req, res)=>{
    Account.create(req.body.account, (err, account) => {
        if (err) {
            req.flash("error", "New account cannot be created error : " + err.message);
            console.log(err);
        }
        res.redirect("/accounts");
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
            res.render("accounts/show", {account : account});
        }
    });
});

// EDIT route: render edit page with details of the couse_id
router.get("/:account_id/edit", isLoggedIn, (req, res) =>{
    Account.findById(req.params.account_id, (err, account) => {
        if(err) {
            console.log(err);
            req.flash("error", "Account not found " + err.message);
            res.redirect('back');
        }
        else {
            res.render("accounts/edit", { account : account });
        }
    });
});

// UPDATE route: this will update the details 
router.put("/:account_id", isLoggedIn, (req, res) =>{
    Account.findByIdAndUpdate(req.params.account_id, req.body.account, (err, account) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update account : " + err.message);
            res.redirect("back");
        }
        else {
            res.redirect("/accounts/" + account._id);
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:account_id", isLoggedIn, (req, res) => {
    Account.findByIdAndRemove(req.params.account_id, (err) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not delete the account : " + err.message);
        }
        res.redirect("/accounts");
    });
});

module.exports = router;