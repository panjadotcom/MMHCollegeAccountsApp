var express = require("express");
var router = express.Router();
var Degree = require("../../models/degree");
var Student = require("../../models/student");
var middleware = require("../../middleware");
var { isLoggedIn, isAdmin } = middleware;

// INDEX Show all Degree.
router.get("/", (req, res) => {
    Degree.find({}, (err, degrees) =>{
        if (err) {
            console.log(err);
        } else {
            res.render("degrees/index", { degrees : degrees , page: 'degrees'});
        }
    });
});

// NEW render new page to create new degree
router.get("/new", isLoggedIn, (req, res) => {
    res.render("degrees/new");
});

// CREATE new degree to be created and updated in DB:
router.post("/", isLoggedIn, (req, res)=>{
    Degree.create(req.body.degree, (err, degree) => {
        if (err) {
            req.flash("error", "New degree cannot be created error ");
            console.log(err);
        }
        res.redirect("/degrees");
    });
});

// SHOW route: This will show the detailed list of the enrolled student.
router.get("/:degree_id", (req, res) => {
    Degree.findById(req.params.degree_id, (err, degree) => {
        if (err) {
            console.log(err);
            req.flash("error", "Degree not found" );
            res.redirect("back");
        } else {
            Student.find( { degreeId : degree._id , isConfirmed : true }, (err, students) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Students not found" );
                    res.render("degrees/show", {degree : degree});
                } else {
                    res.render("degrees/show", {degree : degree , students : students});
                }
            });
            
        }
    });
});

// EDIT route: render edit page with details of the couse_id
router.get("/:degree_id/edit", isLoggedIn, (req, res) =>{
    Degree.findById(req.params.degree_id, (err, degree) => {
        if(err) {
            console.log(err);
            req.flash("error", "Degree not found");
            res.redirect('back');
        }
        else {
            res.render("degrees/edit", { degree : degree });
        }
    });
});

// UPDATE route: this will update the details 
router.put("/:degree_id", isLoggedIn, (req, res) =>{
    Degree.findByIdAndUpdate(req.params.degree_id, req.body.degree, (err, degree) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update degree ");
            res.redirect("back");
        }
        else {
            res.redirect("/degrees");
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:degree_id", isLoggedIn, (req, res) => {
    Degree.findByIdAndRemove(req.params.degree_id, (err) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not delete the degree ");
        }
        res.redirect("/degrees");
    });
});

module.exports = router;