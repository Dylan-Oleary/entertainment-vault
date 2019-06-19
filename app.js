require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.DB_URI, {
    auth:{
       user: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD
    },
    useNewUrlParser: true
}).catch(err => console.log(`ERROR: ${err}`));

const express = require("express");
const path = require("path");

const app = express();

//Add cookie and session support
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

app.use(cookieParser());

app.use(session({
    secret: (process.env.secret || "CAKEISALIE"),
    cookie: {
        max: 10800000
    },
    //Resets each cookie between browser navigating
    resave: true,
    //Every user gets a session
    saveUninitialized: true
}));

app.use(flash());
app.use( (req, res, next) => {
    res.locals.flash = res.locals.flash || {};
    res.locals.flash.success = req.flash("success") || null;
    res.locals.flash.error = req.flash("error") || null;

    next();
});

//Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Serve static files
app.use(express.static(path.join(__dirname, "public")));

//Authentication Helper
const isAuthenticated = (req) => {
    return req.session && req.session.userId;
}

app.use((req, res, next) => {
    req.isAuthenticated = () => {
        if (!isAuthenticated(req)) {
            req.flash('error', "You are not permitted to do this action")
            res.redirect("/");
        }
    }

    res.locals.isAuthenticated = isAuthenticated(req);
    next();
})

const routes = require("./routes");
app.use("/", routes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server is up and running on ${port}`));