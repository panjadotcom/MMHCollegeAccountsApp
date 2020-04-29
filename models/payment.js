var mongoose = require("mongoose");

var PaymentSchema = new mongoose.Schema({
    amount : Number,
    idTxn : String,
    description : String,
    timeTxn : { type: Date, default: Date.now },
    fromAcc : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Account"
        },
        accName : String
    },
    toAcc : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Account"
        },
        accName : String
    }
});

module.exports = mongoose.model("Payment", PaymentSchema);