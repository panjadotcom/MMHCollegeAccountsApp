var express     = require("express");
var router      = express.Router();
var validator   = require("validator");
var Student     = require("../../models/student");
var Account     = require("../../models/account");
var Course      = require("../../models/course");
var middleware  = require("../../middleware");
var multer      = require("multer");

var { isLoggedIn, isAdmin } = middleware;

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, __dirname + '/../../public/resources/images/students');
    },
    filename: (req, file, callback) => {
      callback(null, Date.now() + '-' + file.originalname);
    }
  });

  var imageFilter = (req, file, callback) =>{
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error("Only images files are allowed!"), false);          
      }
      callback(null, true);
  };
   
  var upload = multer({ storage: storage , fileFilter : imageFilter});

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
    Course.find({}, (err, courses ) => {
        if (err) {
            console.log(err);
        } else {
            res.render("students/new", { courses : courses });
        }
    });
});

// CREATE new student to be created and updated in DB:
router.post("/", isLoggedIn, upload.single("image"), (req, res)=>{
    // console.log(req.file);
    req.body.student.image = req.file.path.substring( req.file.path.indexOf("/resources") );;
    // console.log(req.body);
    Student.create(req.body.student, (err, student) => {
        if (err) {
            req.flash("error", "New student cannot be created error : " + err.message);
            console.log(err);
            res.redirect("back");
        } else {
            if( (typeof req.body.course) !== "undefined" ){
                var itemProcessed = 0;
                coursesIds = Object.keys(req.body.course);
                coursesIds.forEach(courseid => {
                    Course.findById(courseid, (err, course) => {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            student.courses.push(course);
                        }
                        itemProcessed++;
                        if (itemProcessed === coursesIds.length) {
                            student.save();
                        }
                    });
                });
            }
            res.redirect("/students");
        }
    });
});

// SHOW route: This will show the details of the student.
router.get("/:student_id", (req, res) => {
    Student.findById(req.params.student_id).populate("courses").exec( (err, student) => {
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
    Student.findById(req.params.student_id).populate("courses").exec( (err, student) => {
        if(err) {
            console.log(err);
            req.flash("error", "student not found " + err.message);
            res.redirect('back');
        }
        else {
            Course.find({}, (err, courses ) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("students/edit", { student : student , courses : courses});
                }
            });
        }
    });
});

// UPDATE route: this will update the details 
router.put("/:student_id", isLoggedIn, upload.single("image"), (req, res) =>{
    // console.log(req.file);
    if (req.file) {
        req.body.student.image = req.file.path.substring( req.file.path.indexOf("/resources") );;
    }
    // console.log(req.body);
    Student.findByIdAndUpdate(req.params.student_id, req.body.student, (err, student) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not update student : " + err.message);
            res.redirect("back");
        }
        else {
            if( (typeof req.body.course) !== "undefined" ){
                var currArray = student.courses.splice(0, student.courses.length);
                var itemProcessed = 0;
                coursesIds = Object.keys(req.body.course);
                coursesIds.forEach(courseid => {
                    Course.findById(courseid, (err, course) => {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            student.courses.push(course);
                        }
                        itemProcessed++;
                        if (itemProcessed === coursesIds.length) {
                            student.save();
                        }
                    });
                });
                while (currArray.length > 0) {
                    console.log(currArray.pop());
                }
            }
            res.redirect("/students/" + student._id);
            
        }
    });
});

// DESTROY route : this will destroy the route.
router.delete("/:student_id", isLoggedIn, (req, res) => {
    Student.findByIdAndRemove(req.params.student_id, (err, student) => {
        if (err) {
            console.log(err);
            req.flash("error", "Could not delete the student : " + err.message);
            res.redirect("/students");
        } else {
            // Delete connected account also ?.
            Account.findByIdAndRemove(student.account.id, (err, account) => {
                if (err) {
                    console.log(err);
                    res.redirect("/students");
                } else {
                    req.flash("success", "Student " + student.name +" deleted successfully");
                    res.redirect("/students");
                }
            });
        }
    });
});

module.exports = router;