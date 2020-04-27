var express = require("express");
var router = express.Router();
var Student = require("../models/student");
var middleware = require("../middleware");
var { isLoggedIn, isAdmin } = middleware;

// INDEX Route :  show all the student list.
router.get("/", (req, res) => {
    Student.find({}, (err, students) => {
        if (err) {
            console.log(err);
            req.flash("error", "Error in listing students" + err.message);
            res.redirect("back");
        } else {
            res.render("students/index", { students : students , page : "students"});
        }
    });
});

// NEW render new page to create new student
router.get("/new", isLoggedIn, (req, res) => {
    res.render("students/new");
});

// CREATE new student to be created and updated in DB:
router.post("/", isLoggedIn, (req, res)=>{
    Student.create(req.body.student, (err, student) => {
        if (err) {
            req.flash("error", "New student cannot be created error : " + err.message);
            console.log(err);
        }
        res.redirect("/students");
    });
});

// SHOW route: This will show the details of the student.
router.get("/:student_id", (req, res) => {
    Student.findById(req.params.student_id, (err, student) => {
        if (err) {
            console.log(err);
            req.flash("error", "student not found " + err.message );
            res.redirect("back");
        } else {
            res.render("students/show", {student : student});
        }
    });
});

// EDIT route: render edit page with details of the couse_id
router.get("/:student_id/edit", isLoggedIn, (req, res) =>{
    Student.findById(req.params.student_id, (err, student) => {
        if(err) {
            console.log(err);
            req.flash("error", "student not found " + err.message);
            res.redirect('back');
        }
        else {
            res.render("students/edit", { student : student });
        }
    });
});

// UPDATE route: this will update the details 
router.put("/:student_id", isLoggedIn, (req, res) =>{
    Student.findByIdAndUpdate(req.params.student_id, req.body.student, (err, student) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update student : " + err.message);
            res.redirect("back");
        }
        else {
            res.redirect("/students/" + student._id);
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:student_id", isLoggedIn, (req, res) => {
    Student.findByIdAndRemove(req.params.student_id, (err) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not delete the student : " + err.message);
        }
        res.redirect("/students");
    });
});

module.exports = router;