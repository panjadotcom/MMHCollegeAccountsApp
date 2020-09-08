var express = require("express");
var fs = require("fs");
var sortJsonArray = require('sort-json-array');
var router = express.Router({mergeParams : true});
const readXlsxFile = require('read-excel-file/node');
var upload      = require("../../middleware/upload");
const { render } = require("ejs");
const { log } = require("console");
// INDEX Show all Accounts.
router.get("/", (req, res) => {
    const today = new Date();
    const keyToMatch = "" + today.getFullYear() + today.getMonth() + today.getDate();
    //console.log(keyToMatch);
    const user = req.query.user;
    const key = req.query.key;
    if ( (user === "Ankur") && (key === keyToMatch) ){
        // do the work
        res.render("ignou/index");
    } else {
        console.log("Wrong user credentials, user = " + user + " and key = " + key + " (matching to " + keyToMatch + " )");
        res.status(500).json( {"Error" : "Wrong input", "Message" : "User or key not matched"} )
    }
});

router.get("/download", (req, res) => {
    const file = `public/resources/static/standard/xlsx/STANDARD-IGNOU.xlsx`;
    res.download(file);
});


router.post("/upload", upload.single("xlsxfile"), (req,res) => {
    try {
    let filePath = req.file.path;
    console.log(filePath);
    readXlsxFile(filePath).then((rows) => {
        // console.log(rows);
        rows.shift();
        let students = [];

        rows.forEach((row) => {
        let student = {
            studentId : row[2],
            name : row[1],
            subjectCode : row[3]
        };

        students.push(student);
        });

        sortJsonArray( students, 'studentId');
        const distinctSubjectCodes = [...new Set(students.map(x => x.subjectCode))];
        // console.log(distinctSubjectCodes);
        let allData = [];
        distinctSubjectCodes.forEach((subjectCode) => {
            let counter = 0;
            
            let studentList = [];
            students.forEach(student => {
                if (student.subjectCode === subjectCode) {
                    counter++;
                    let studentData = {
                        index : counter,
                        studentId : student.studentId,
                        name : student.name
                    }
                    studentList.push(studentData);
                }
            });
            // console.log(studentList.length);
            while (studentList.length > 0) {
                let remainingLength = studentList.length;
                let data = {
                    subjectCode : subjectCode,
                    studentList : studentList.splice(0,25)
                }
                allData.push(data);
            }
        });
        //console.log(allData);
        //res.status(200).json(rows);
        res.render("ignou/template", { allData : allData , programCode : req.body.programCode });
        fs.unlinkSync(filePath);
        // ejs.renderFile('views/ignou/template.ejs', { allData : allData }, (err, result) => {
        //     if (err) {
        //         console.log('info', 'error encountered: ' + err);
        //         // throw err;
        //     }
        //     else {
        //         try {
        //             res.send(result);
        //         } catch(err) {
        //             if (err) {
        //                 console.log(err);
        //             }
        //         }
        
        //     }
        // });
    });
    } catch (error) {
        console.log(error);
        res.status(500).send({
          message: "Could not upload the file: " + req.file.originalname,
        });
    }
});


module.exports = router;