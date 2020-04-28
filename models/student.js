var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
    name : String,
    image : String,
    description : String,
    account : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Account"
        },
        name : String
    },
    courses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Course"
        }
    ]
});

module.exports = mongoose.model("Student", StudentSchema);