var mongoose = require("mongoose");
var Student = require("./models/student");
var Course = require("./models/course");
var Account = require("./models/account");

function seedDB() {
    Student.deleteMany({}, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            Course.deleteMany({}, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    Account.deleteMany({}, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            for (let index = 1; index < 9; index++) {
                                var student = {
                                    name : "Student " + index,
                                    image : "/resources/images/students/student" + index + ".jpg",
                                    description : "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
                                };
                                Student.create(student, (err, student) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("Student Created");
                                        var account = {
                                            name : "Account " + index,
                                            accnumber : index * 1000 + index,
                                            description : "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
                                        };
                                        Account.create(account, (err, account) => {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                console.log("Account Created");
                                                student.account.id = account._id;
                                                student.account.name = account.name;
                                                student.save();
                                            }
                                        });
                                    }
                                });
                            }
                            for (let index = 1; index < 9; index++) {
                                var course = {
                                    name : "Course " + index,
                                    fee : index * 1000,
                                    duration : (index % 4) + 1,
                                    description : "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc."
                                };
                                Course.create(course, (err) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("Course Created");
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}

module.exports = seedDB;