var mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
    name : String,
    fee  : Number,
    duration : Number,
    description : String
});

module.exports = mongoose.model("Course", CourseSchema);