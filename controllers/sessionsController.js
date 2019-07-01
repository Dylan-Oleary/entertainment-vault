const User = require("../models/user");
const toastrConfig = require("../utils/toastrConfig");

exports.authenticate = (req, res) => {
    User.findOne({
        email: req.body.email
    })
    .then( user => {
        user.authenticate(req.body.password, (err, isMatch) => {
            if(err) throw new Error(err);

            if (isMatch){
                req.session.userId = user.id;
                req.session.userName = user.username;
                res.redirect("/");
            } else {
                req.toastr.error("Your credentials do not match, please try again.", "Woops!", toastrConfig);
                res.redirect("/login");
            }
        })
    })
    .catch(() => {
        toastrConfig.toastClass = "error";
        req.toastr.error("Your credentials do not match, please try again.", "Woops!", toastrConfig);
        res.redirect("/login");
    });
};

exports.login = async (req, res) => {
    //If the user is logged in, re-direct them to home if they try to hit /login
    if(req.session.userId){
        res.redirect("/");
    } else {
        res.render("sessions/login", {
            title: "Login"
        });
    }
};

exports.logout = (req, res) => {
    req.session.userId = null;
    req.session.userName = null;
    req.toastr.success("You have been successfully logged out!", "Goodbye!", toastrConfig);
    res.redirect("/login");
};