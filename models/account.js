var mongoose = require("mongoose");

var AccountSchema = new mongoose.Schema({
    name : String,
    number : String,
    description : String,
    payments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Payment"
        }
    ]
});

module.exports = mongoose.model("Account", AccountSchema);