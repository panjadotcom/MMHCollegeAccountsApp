var mongoose = require("mongoose");

var AccountSchema = new mongoose.Schema({
    name : {
        type : String,
        unique : true
    },
    number : String,
    description : String,
    isStudentAccount : {
        type : Boolean,
        default : false
    },
    payments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Payment"
        }
    ]
});

module.exports = mongoose.model("Account", AccountSchema);