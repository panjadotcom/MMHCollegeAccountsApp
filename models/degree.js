const mongoose = require("mongoose");
var DegreeSchema = new mongoose.Schema({
    degreeId : {
        type : String,
        unique : true
    },
    name : String
});

module.exports = mongoose.model("Degree", DegreeSchema);