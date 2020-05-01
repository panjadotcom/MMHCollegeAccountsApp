//  index routes 
var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", (req, res) => {
    res.render("landing");
});

// show register form
router.get("/register", (req, res) => {
   res.render("register", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === process.env.ADMIN_CODE) {
      newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, () => {
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/"); 
        });
    });
});

//show login form
router.get("/login", (req, res) => {
   res.render("login", { page : "login" }); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        failureRedirect: "/login",
        failureFlash: true
    }), (req, res) => {
        var returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        req.flash("success", 'Welcome to MMH College Accounts app!');
        res.redirect(returnTo);
        
});

// logout route
router.get("/logout", (req, res) => {
    if(req.user){
        var user = req.user;
        req.logout();
        // req.flash("success", "See you later " + user.username);
    }
   res.redirect("/");
});

module.exports = router;