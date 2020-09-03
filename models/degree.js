const mongoose = require("mongoose");
var DegreeSchema = new mongoose.Schema({
    degreeId : {
        type : String,
        unique : true
    },
    name : String,
    feeBoysMF : Number,
    feeBoysBF : Number,
    feeGirlsMF : Number,
    feeGirlsBF : Number,
    maxSeat : Number
});

module.exports = mongoose.model("Degree", DegreeSchema);