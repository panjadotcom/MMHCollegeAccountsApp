// import  packages
var express             = require("express"),
    session             = require("express-session"),
    flash               = require("express-flash"),
    bodyparser          = require("body-parser"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    localStrategy       = require("passport-local"),
    methodOverride      = require("method-override");
    
// load env 
require("dotenv").config();

// import models
var User = require("./models/user");


// import routes
var indexRoute     = require("./routes/index");
var courseRoute    = require("./routes/courses");
var degreeRoute    = require("./routes/degrees");
var studentRoute    = require("./routes/students");
var accountRoute    = require("./routes/accounts");
var ignouRoute    = require("./routes/ignou");
var paymentRoute    = require("./routes/payments");


// INIT app
var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());


// Connect to database
// export DATABASE_URL="mongodb://localhost:27017/mmhcollege"
const uri = process.env.DATABASE_URL;
mongoose.connect(uri, { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false });

// import seedDB file to seed the database with default data.
// var seedDB = require("./seeds");
// seedDB(); // Seed the database 

// Passport configurations
app.use(session({
    secret : "PANJADOTCOM IS THE CODER FOR THIS",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Add middle ware for renders
app.use( (req, res, next)=> {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoute);
app.use("/courses", courseRoute);
app.use("/degrees", degreeRoute);
app.use("/students", studentRoute);
app.use("/accounts", accountRoute);
app.use("/ignou", ignouRoute);
app.use("/:acc_parent_type/:acc_parent_id/accounts", accountRoute);
app.use("/accounts/:account_id/payments", paymentRoute);
app.use("/:acc_parent_type/:acc_parent_id/accounts/:account_id/payments", paymentRoute);

// Start the server.
app.listen(process.env.PORT, process.env.IP, () => {
    console.log("MMH College salary server up and running");
});
