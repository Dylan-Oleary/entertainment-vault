const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;
const Movie = require("../models/movie");

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        watchList: {
            type: Array
        },
        favouritesList: {
            type: Array
        },
        ratedList: {
            type: Array
        }
    },
    {
        timestamps: true
    }
);

// Virtual Attributes for passwordConfirmation
UserSchema.virtual("passwordConfirmation")
.get(() => this.passwordConfirmation)
.set(value => this.passwordConfirmation = value);

//Pre-Save Hook Operation
UserSchema.pre("save", function(next){
    const user = this;

    if(!user.isModified("password")) return next();

    if(user.password !== user.passwordConfirmation) throw new Error("Your Passwords Do Not Match");

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        })
    });
});

//Helper Method - Compare hashed password to plain text
UserSchema.methods.authenticate = function(plainPassword, callback) {
    //plain text, hash, callback
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if(err) return callback(err);
        callback(null, isMatch);
    })
};

module.exports = mongoose.model("User", UserSchema);