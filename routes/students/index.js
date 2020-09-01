var express     = require("express");
var router      = express.Router();
var validator   = require("validator");
var Student     = require("../../models/student");
var Degree     = require("../../models/degree");
var Account     = require("../../models/account");
var Course      = require("../../models/course");
var middleware  = require("../../middleware");
var upload      = require("../../middleware/upload");

var { isLoggedIn, isAdmin } = middleware;


// INDEX Route :  show all the student list.
router.get("/", (req, res) => {
    Student.find({}, (err, students) => {
        if (err) {
            console.log(err);
            req.flash("error", "Error in listing students" + err.message);
            res.redirect("back");
        } else {
            Degree.find({}, (err, degrees) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Error in listing degrees" + err.message);
                    res.redirect("back");
                } else {
                    res.render("students/index", { students : students , degrees : degrees, page : "students", selecteddegree : "ALL"});     
                }
            });
        }
    });
});

router.get("/degree/:degree_id", (req,res) => {
    Degree.findById(req.params.degree_id, (err, degree) => {
        if (err) {
            console.log(err);
            req.flash("error", "Error in finding degree" + err.message);
            res.redirect("back");
        } else {
            Student.find({degree : { id : degree._id}}, (err, students) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Error in finding students" + err.message);
                    res.redirect("back");
                } else {
                    Degree.find({}, (err, degrees) => {
                        if (err) {
                            console.log(err);
                            req.flash("error", "Error in listing degrees" + err.message);
                            res.redirect("back");
                        } else {
                            res.render("students/index", { students : students , degrees : degrees, page : "students", selecteddegree : degree.degreeId});     
                        }
                    });
                }
            });
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

const readXlsxFile = require('read-excel-file/node');
const { isValidObjectId } = require("mongoose");
// BULK UPLOAD STUDENTS in the database:
// router.post("/upload",isLoggedIn, upload.single("xlsxfile"), (req,res) => {
router.post("/upload", upload.single("xlsxfile"), (req,res) => {
    try {
    let path = req.file.path;
    console.log(path);
    Degree.findById(req.body.degree, (err, degree) => {
        if (err) {
            console.log(err);
            req.flash("error", "Degree not found " + err.message);
            res.redirect("back");
        } else {
            readXlsxFile(path).then((rows) => {
                // skip header
                //console.log(rows);
                rows.shift();
            
                let students = [];
    
                rows.forEach((row) => {
                let student = {
                    studentId : row[8],
                    name : row[9],
                    gender : row[10],
                    dob : Date.parse(row[11]),
                    father : row[13],
                    mother : row[14],
                    mobile : row[15],
                    email : row[17],
                    adhar : row[18],
                    address : row[19],
                    catagory : row[20],
                    degree : {
                        id : degree._id
                    }
                };
        
                students.push(student);
            });
            Student.insertMany(students, {ordered : false}, (err, docs) => {
                if (err) {
                    console.log(err.result);
                    req.flash("error",  "New " + err.result.nInserted + " Students entry created");
                }
                else {
                    req.flash("error", "New " + docs.length + " Students entry created");
                }
                res.redirect("/students");
            });
        });
        }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
          message: "Could not upload the file: " + req.file.originalname,
        });
      }
});

// CREATE:: new student to be created and updated in DB:
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
            res.redirect("/students/" + student._id);
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

// Confirm route: This will show confirmation page.
router.get("/:student_id/confirm", isLoggedIn, (req, res) =>{
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
                    res.render("students/confirm", { student : student , courses : courses});
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