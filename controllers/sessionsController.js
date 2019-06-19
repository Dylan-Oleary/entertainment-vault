const User = require("../models/user");

exports.authenticate = (req, res) => {
    User.findOne({
        email: req.body.email
    })
    .then( user => {
        if(!user) throw new Error("ERROR: Your credentials do not match");

        user.authenticate(req.body.password, (err, isMatch) => {
            if(err) throw new Error(err);

            if (isMatch){
                req.session.userId = user.id;

                req.flash("success", "You are now logged in");
                res.redirect("/");
            } else {
                req.flash("error", "ERROR: Your credentials do not match");
                res.redirect("/login");
            }
        })
    })
    .catch(err => {
        req.flash("error", `ERROR: ${err}`);
        res.redirect("/login");
    });
};

exports.login = (req, res) => {
    res.render("sessions/login", {
        title: "Login"
    });
};

exports.logout = (req, res) => {
    req.session.userId = null;
    req.flash("success", "You are now logged out");
    res.redirect("/");
};