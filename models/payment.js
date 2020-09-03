var mongoose = require("mongoose");

var PaymentSchema = new mongoose.Schema({
    paymentId : {
        type : String,
        unique : true
    },
    paymentTime : { type: Date, default: Date.now },
    bankName : String,
    bankPaymentId : String,
    bankPaymentTime : { type: Date, default: Date.now },
    amount : Number,
    fromAccId : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Account"
    },
    toAccId : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Account"
    }
});

module.exports = mongoose.model("Payment", PaymentSchema);