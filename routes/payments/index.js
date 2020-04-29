var express = require("express");
var router = express.Router({mergeParams : true});
var Account = require("../../models/account");
var Student = require("../../models/student");
var Payment = require("../../models/payment");
var middleware = require("../../middleware");
var { isLoggedIn, isAdmin , isAccountPathValid} = middleware;

// INDEX Route. Show all payments of the account passed. This will populate on accounts show page
// router.get("/", (req, res) => {
//     console.log(req.params.acc_parent_type, req.params.acc_parent_id, req.params.account_id);
//     Account.findById(req.params.account_id).populate("payments").exec( ( err, account) => {
//         if (err) {
//             console.log(err);
//             return res.redirect("back");
//         }
//         res.render("payments/index", {
//             account : account,
//             acc_parent_type : req.params.acc_parent_type,
//             acc_parent_id: req.params.acc_parent_id,
//             account_id : req.params.account_id
//         });
//     });
// });

// NEW route. Create new payment.
router.get("/new", (req, res) => {
    console.log(req.params.acc_parent_type, req.params.acc_parent_id, req.params.account_id);
    Account.findById(req.params.account_id, (err, fromAcc) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            Account.findOne({ name : "ADMIN" }, (err, toAcc) =>{
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    //console.log(fromAcc, toAcc);
                    res.render("payments/new", {
                        fromAcc : fromAcc,
                        toAcc : toAcc,
                        acc_parent_type : req.params.acc_parent_type,
                        acc_parent_id: req.params.acc_parent_id,
                        account_id : req.params.account_id
                     });                
                }
            });
        }
    });
});

// CREATE route: this will create new payment in database.
router.post("/", (req, res) =>{
    console.log(req.params.acc_parent_type, req.params.acc_parent_id, req.params.account_id);
    //console.log(req.body);
    Account.findById(req.body.payment.fromAccId, (err, fromAcc) => {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            Account.findById(req.body.payment.toAccId, (err, toAcc) =>{
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    var payment = {
                        amount : req.body.payment.amount,
                        idTxn : req.body.payment.idTxn,
                        description : req.body.payment.description,
                        fromAcc : {
                            id : fromAcc._id,
                            accName : fromAcc.name
                        },
                        toAcc : {
                            id : toAcc._id,
                            accName : toAcc.name
                        }
                    };
                    Payment.create(payment, (err, payment) =>{
                        if (err) {
                            console.log(err);
                            res.redirect("back");
                        } else {
                            //console.log(payment);
                            fromAcc.payments.push(payment);
                            fromAcc.save();
                            toAcc.payments.push(payment);
                            toAcc.save();
                            res.redirect("/" + req.params.acc_parent_type + "/" + req.params.acc_parent_id + "/accounts/" + req.params.account_id );
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;