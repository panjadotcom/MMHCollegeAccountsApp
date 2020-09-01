var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
    studentId : {
        type : String,
        unique : true
    },
    name : String,
    gender : String,
    dob : Date,
    father : String,
    mother : String,
    mobile : String,
    email : String,
    adhar : String,
    address : String,
    catagory : String,
    isConfirmed : {
        type : Boolean,
        default : false
    },
    account : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Account"
        },
        name : String
    },
    degree : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Degree"
        }
    },
    courses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Course"
        }
    ]
});

module.exports = mongoose.model("Student", StudentSchema);