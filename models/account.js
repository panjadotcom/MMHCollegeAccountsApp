var mongoose = require("mongoose");

var AccountSchema = new mongoose.Schema({
    name : String,
    accnumber : String,
    description : String,
    payment : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Payment"
        }
    ]
});

module.exports = mongoose.model("Account", AccountSchema);