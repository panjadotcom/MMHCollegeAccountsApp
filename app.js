// import  packages
var express         = require("express"),
    session         = require("express-session"),
    flash           = require("express-flash"),
	bodyparser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    methodOverride  = require("method-override");
    


// import models
var User = require("./models/user");


// import routes
var indexRoutes     = require("./routes/index");
var courseRoutes    = require("./routes/courses");

// INIT app
var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());


// Connect to database
mongoose.connect("mongodb://localhost:27017/mmhcollege", { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false });


// import seedDB file to seed the database with default data.
//var seedDB = require("./seeds");
//seedDB(); // Seed the database 

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

app.use("/", indexRoutes);
app.use("/courses", courseRoutes);

// Start the server.
app.listen(8080, () => {
    console.log("MMH College salary server up and running");
});
