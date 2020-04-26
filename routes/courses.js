var express = require("express");
var router = express.Router();
var Course = require("../models/course");
var middleware = require("../middleware");
var { isLoggedIn, isAdmin } = middleware;

// INDEX Show all Courses.
router.get("/", (req, res) => {
    Course.find({}, (err, courses) =>{
        if (err) {
            console.log(err);
        } else {
            res.render("courses/index", { courses : courses , page: 'courses'});
        }
    });
});

// NEW render new page to create new course
router.get("/new", isLoggedIn, (req, res) => {
    res.render("courses/new");
});

// CREATE new course to be created and updated in DB:
router.post("/", isLoggedIn, (req, res)=>{
    Course.create(req.body.course, (err, course) => {
        if (err) {
            req.flash("error", "New course cannot be created error : " + err.message);
            console.log(err);
        }
        res.redirect("/courses");
    });
});

// SHOW route: This will show the details of the course.
router.get("/:course_id", (req, res) => {
    Course.findById(req.params.course_id, (err, course) => {
        if (err) {
            console.log(err);
            req.flash("error", "Course not found " + err.message );
            res.redirect("back");
        } else {
            res.render("courses/show", {course : course});
        }
    });
});

// EDIT route: render edit page with details of the couse_id
router.get("/:course_id/edit", isLoggedIn, (req, res) =>{
    Course.findById(req.params.course_id, (err, course) => {
        if(err) {
            console.log(err);
            req.flash("error", "Course not found " + err.message);
            res.redirect('back');
        }
        else {
            res.render("courses/edit", { course : course });
        }
    });
});

// UPDATE route: this will update the details 
router.put("/:course_id", isLoggedIn, (req, res) =>{
    Course.findByIdAndUpdate(req.params.course_id, req.body.course, (err, course) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update course : " + err.message);
            res.redirect("back");
        }
        else {
            res.redirect("/courses/" + course._id);
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:course_id", isLoggedIn, (req, res) => {
    Course.findByIdAndRemove(req.params.course_id, (err) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not delete the course : " + err.message);
        }
        res.redirect("/courses");
    });
});

module.exports = router;