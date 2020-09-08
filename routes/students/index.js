var express     = require("express");
var router      = express.Router();
var validator   = require("validator");
var fs = require("fs");
var Student     = require("../../models/student");
var Degree     = require("../../models/degree");
var Account     = require("../../models/account");
var Course      = require("../../models/course");
var Payment     = require("../../models/payment");
var middleware  = require("../../middleware");
var upload      = require("../../middleware/upload");

var { isLoggedIn, isAdmin } = middleware;


// INDEX Route :  show all the student list.
router.get("/", (req, res) => {
    Degree.find({}, (err, degrees) => {
        if (err) {
            console.log(err);
            req.flash("error", "Error in listing degrees" + err.message);
            res.redirect("back");
        } else {
            let students = [];
            res.render("students/index", { students : students , degrees : degrees, page : "students", selecteddegree : "SELECT"});     
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
            Student.find({ degreeId : degree._id, isConfirmed : false }, (err, students) => {
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

router.get("/download", isLoggedIn, (req, res) => {
    const file = `public/resources/static/standard/xlsx/STANDARD-StudentList.xlsx`;
    res.download(file);
});

const readXlsxFile = require('read-excel-file/node');
const { isValidObjectId } = require("mongoose");
const student = require("../../models/student");
const flash = require("express-flash");
// BULK UPLOAD STUDENTS in the database:
// router.post("/upload",isLoggedIn, upload.single("xlsxfile"), (req,res) => {
router.post("/upload", upload.single("xlsxfile"), (req,res) => {
    try {
    let filePath = req.file.path;
    console.log(filePath);
    Degree.findById(req.body.degree, (err, degree) => {
        if (err) {
            console.log(err);
            req.flash("error", "Degree not found " + err.message);
            res.redirect("back");
        } else {
            readXlsxFile(filePath).then((rows) => {
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
                    degreeId : degree._id
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
                fs.unlinkSync(filePath);
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
    Student.findById(req.params.student_id).populate("degreeId").exec( (err, student) => {
        if(err) {
            console.log(err);
            req.flash("error", "student not found " + err.message);
            res.redirect('back');
        }
        else {
            Degree.find({}, (err, degrees ) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("students/confirm", { student : student , degrees : degrees});
                }
            });
        }
    });
});

// Confirmation route: Update the details of student.
router.put("/:student_id/confirm", (req, res) => {
    Student.findById(req.params.student_id, (err, student) => {
        if (err) {
            console.log(err);
            req.flash("error", "student not found " + err.message);
            res.redirect('back');
        } else {
            // Find the main and mf-bf account first then move ahaid.
            Account.findOne({ name : "MAIN-ACCOUNT"}, (err, mainAccount) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "main account not found " + err.message);
                    res.redirect('back');
                } else {
                    Account.findOne({ name : "MF-ACCOUNT"}, (err, mfAccount) => {
                        if (err) {
                            console.log(err);
                            req.flash("error", "mf account not found " + err.message);
                            res.redirect('back');
                        } else {
                            Account.findOne({ name : "BF-ACCOUNT"}, (err, bfAccount) => {
                                if (err) {
                                    console.log(err);
                                    req.flash("error", "bf account not found " + err.message);
                                    res.redirect('back');
                                } else {
                                    // Now create student account and add ayment.
                                    // console.log(mainAccount);
                                    // console.log(mfAccount);
                                    // console.log(bfAccount);
                                    let account = {
                                        name : student.name,
                                        number : student.studentId,
                                        isStudentAccount : true,
                                        description : "Student Account details : { Mobile : " + student.mobile + " , Email : " + student.email + " }"
                                    };
                                    Account.create(account, (err, account) => {
                                        if (err) {
                                            console.log(err);
                                            req.flash("error", "student account cannot be created found " + err.message);
                                            res.redirect('back');
                                        } else {
                                            // Now add payment to accounts.
                                            let timenow = new Date();
                                            let payments = [];
                                            let paymentMain = {
                                                //paymentId : "MMH" + Math.floor(timenow / 1000 ) +timenow.getFullYear() + timenow.getMonth() + timenow.getDate() + timenow.getHours() + timenow.getMinutes() + timenow.getSeconds(),
                                                paymentId : "MMH" + Math.floor(timenow / 1000 ),
                                                bankName : req.body.payment.bankName,
                                                bankPaymentId : req.body.payment.bankPaymentId,
                                                bankPaymentTime : Date.parse(req.body.payment.bankPaymentTime),
                                                amount : Number.parseInt(req.body.payment.amountMF) + Number.parseInt(req.body.payment.amountBF) + Number.parseInt(req.body.payment.amountOther),
                                                fromAccId : account._id,
                                                toAccId : mainAccount._id
                                            };
                                            payments.push(paymentMain);
                                            let paymentMF = {
                                                paymentId : "MF" + Math.floor(timenow / 1000 ),
                                                bankName : req.body.payment.bankName,
                                                bankPaymentId : req.body.payment.bankPaymentId,
                                                bankPaymentTime : Date.parse(req.body.payment.bankPaymentTime),
                                                amount : req.body.payment.amountMF,
                                                fromAccId : mainAccount._id,
                                                toAccId : mfAccount._id
                                            };
                                            payments.push(paymentMF);
                                            let paymentBF = {
                                                paymentId : "BF" + Math.floor(timenow / 1000 ),
                                                bankName : req.body.payment.bankName,
                                                bankPaymentId : req.body.payment.bankPaymentId,
                                                bankPaymentTime : Date.parse(req.body.payment.bankPaymentTime),
                                                amount : req.body.payment.amountBF,
                                                fromAccId : mainAccount._id,
                                                toAccId : bfAccount._id
                                            };
                                            payments.push(paymentBF);
                                            
                                            Payment.insertMany(payments, {ordered : false}, (err, payments) => {
                                                if (err) {
                                                    console.log(err);
                                                    req.flash("error", "payments cannot be created " + err.message);
                                                } else {
                                                    console.log(payments.length + " created in the database");
                                                }
                                                // now confirm the student.
                                                student.isConfirmed = true;
                                                student.accountId = account._id;
                                                student.save((err) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    console.log("Student confirmed...");
                                                    res.redirect("/students/degree/" + student.degreeId);
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
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
            Account.findByIdAndRemove(student.accountId, (err, account) => {
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