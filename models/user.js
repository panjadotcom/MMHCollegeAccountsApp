var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    dob : Date,
    gender : String,
    email : String,
    phone : String,
    designation : String,
    username : String,
    password : String,
    isAdmin : {
        type : Boolean,
        default : false
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);