const User = require("../models/user");
const Movie = require("../models/movie");
const genreFormatter = require("../utils/genreFormatter");
const dateFormatter = require("../utils/dateFormatter");
const toastrConfig = require("../utils/toastrConfig");
const fs = require('fs');
const path = require("path");

exports.account = async (req, res) => {
    await req.isAuthenticated();

    User.findById(req.session.userId)
    .then( async user => {
        const profilePicture = user.profilePicture.data !== null ? new Buffer.from(user.profilePicture.data).toString("base64") : null

        user.joinDate = dateFormatter.formatDate(new Date(user.createdAt));
        user.lastUpdateDate = dateFormatter.formatDate(new Date(user.updatedAt));

        res.render("users/account", {
            title: "My Account",
            user: user,
            profilePicture: profilePicture
        })
    })
}

exports.create = (req, res) => {
    User.create({
        firstName: req.body.user.firstName,
        lastName: req.body.user.lastName,
        email: req.body.user.email,
        username: req.body.user.username,
        password: req.body.user.password,
        passwordConfirmation: req.body.user.passwordConfirmation,
        profilePicture: {
            contentType: null,
            data: null
        }
    })
    .then(() => {
        res.redirect("/login");
    })
    .catch( err => {
        console.log(err);
        res.redirect("users/new", {
            message: "It looks like you don't have any movies in your list, try searching for some!"
        })
    })
};

exports.delete = async (req, res) => {
    await req.isAuthenticated();

    if(req.body.user.id && req.session.userId && req.body.user.id === req.session.userId){
        User.deleteOne({
            _id: req.body.user.id
        })
        .then( () => {
            //Clear the session
            req.session.userId = null;
            req.session.userName = null;

            req.toastr.success("Your account was successfully deleted!", "Success");
            res.redirect("/login");
        })
        .catch( () => {
            req.toastr.error("Error", "There was an error deleting your account");
            res.redirect("users/account");
        })
    }
}

exports.updateUser = async (req, res) => {
    await req.isAuthenticated();

    const userUpdates = {};

    if(req.body.user){
        userUpdates.firstName = req.body.user.firstName;
        userUpdates.lastName = req.body.user.lastName;
        userUpdates.email = req.body.user.email;
    }

    if(req.file){
        userUpdates.profilePicture = {
            contentType : req.file.mimetype,
            size: req.file.size,
            data: fs.readFileSync(req.file.path)
        }

        fs.unlinkSync(req.file.path);
    }
    //Add if userUpdates has any properties, then update, if not, throw toastr!!! No point in writing nothing to the DB
    User.updateOne({
        _id: req.body.id
    },{
        $set: userUpdates
    },{
        runValidators: true
    })
    .then( async () => {    
        req.toastr.success("Profile successfully updated", "Update successful!");
        res.redirect("/users/account");
    })
    .catch(() => {
        req.toastr.error("Update Failed!", "Update unsuccessful!");
        res.redirect("/users/account");
    })
}

exports.new = (req, res) => {
    res.render("users/new", {
        title: "New User"
    });
};

//Get User Lists
exports.getWatchList = async (req, res) => {
    await req.isAuthenticated();

    const watchListIds = await User.findById(req.session.userId).then( user => {
        return user.watchList.map(movie => movie.id)
    });

    Movie.find({
        _id: {"$in": watchListIds}
    })
    .then(movies => {
        if(movies.length !== 0) {
            const movieObjectsToRender = movies.map(movie => {
                movie.genres = genreFormatter.formatGenres(movie.genres);

                return movie;
            })

            res.render("movies/index", {
                movies: movieObjectsToRender,
                path: {
                    slug: req.path,
                    formattedSlug: "WatchList"
                }
            })
        } else {
            res.render("pages/error", {
                message: "You don't have anything on your watchlist!"
            })
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getFavouritesList = async (req, res) => {
    await req.isAuthenticated();

    const favouritesListIds = await User.findById(req.session.userId).then( user => {
        return user.favouritesList.map(movie => movie.id)
    });

    Movie.find({
        _id: {"$in": favouritesListIds}
    })
    .then(movies => {
        if(movies.length !== 0) {
            res.render("movies/index", {
                movies: movies,
                path: {
                    slug: req.path,
                    formattedSlug: "Favourites"
                }
            })
        } else {
            res.render("pages/error", {
                message: "You don't have any favourites!!"
            })
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getRatedList = async (req, res) => {
    await req.isAuthenticated();

    const ratedListIds = await User.findById(req.session.userId).then( user => {
        return user.ratedList.map(movie => movie.id)
    });

    Movie.find({
        _id: {"$in": ratedListIds}
    })
    .then(movies => {
        if(movies.length !== 0) {
            res.render("movies/index", {
                movies: movies,
                path: {
                    slug: req.path,
                    formattedSlug: "Rated List"
                }
            })
        } else {
            res.render("pages/error", {
                message: "You haven't rated any movies!"
            })
        }
    })
    .catch(err => {
        console.log(err);
    })
}

//Update User Lists
exports.updateRatedList = async (req, res) => {
    await req.isAuthenticated();

    const movie = req.body.movie;

    //Check if movie appears in Rated List - if it doesn't add it, if it does - change its rating or set it to null and remove it if 0
    const ratedListMovie = await User.findById(req.session.userId)
    .then(user => {
        for(let i = 0; i < user.ratedList.length; i++){
            if(user.ratedList[i].id == movie.id){
                return user.ratedList[i];
            }
        }
    })
    .catch(err => {
        console.log(err);
    })

    //If it's not rated and on the list, add it
    if(!ratedListMovie){
        User.updateOne({
            _id:req.session.userId
        },{
            $push: {
                ratedList: {
                    id: movie.id,
                    title: movie.title,
                    rating: movie.rating
                }
            }
        })
        .then( () => {
            toastrConfig.toastClass = "rated";
            req.toastr.success(`${movie.title} got ${movie.rating}/5 stars from you. You can find it on your Rated List`, "Success", toastrConfig);

            res.redirect(`/movies/${req.body.movie.id}`)
        })
        .catch( err => {
            res.render("pages/error", {
                message: "something went wrong"
            })
        })
    }else{
        //Is on Rated List

        //Check if the rating is 0 and remove it or update rating
        if(movie.rating > 0){
            User.updateOne({
                _id : req.session.userId,
                "ratedList.id": movie.id,
            },{
                $set: {
                    "ratedList.$.rating": movie.rating
                }
            })
            .then( () => {
                toastrConfig.toastClass = "rated";
                req.toastr.success(`${movie.title} got ${movie.rating}/5 stars from you. You can find it on your Rated List`, "Success", toastrConfig);

                res.redirect(`/movies/${req.body.movie.id}`)
            })
            .catch( err => {
                res.render("pages/error", {
                    message: "Something went wrong"
                })
            })
        }else {
            //Remove it from the list
            User.updateOne({
                _id:req.session.userId
            },{
                $pull: {
                    ratedList: {
                        id: movie.id,
                        title: movie.title
                    }
                }
            })
            .then( () => {
                toastrConfig.toastClass = "rated";
                req.toastr.success(`${movie.title} has been removed from your rated list`, "Success", toastrConfig);

                if(req.body.movie.remove){
                    res.redirect(`/users/rated`)
                } else {
                    res.redirect(`/movies/${req.body.movie.id}`)
                }
            })
            .catch( err => {
                res.render("pages/error", {
                    message: "Something went wrong"
                })
            })
        }
    }
}

exports.updateFavouritesList = async (req, res) => {
    await req.isAuthenticated();

    const movie = req.body.movie;

    //Check if movie appears in Favourites List - if it doesn't add it, if it does remove it
    const favouritesListMovie = await User.findById(req.session.userId)
    .then(user => {
        for(let i = 0; i < user.favouritesList.length; i++){
            if(user.favouritesList[i].id == movie.id){
                return user.favouritesList[i];
            }
        }
    })
    .catch(err => {
        console.log(err);
    })

    //If it is not on the Favourite List, add it
    if(!favouritesListMovie){
        User.updateOne({
            _id:req.session.userId
        },{
            $push: {
                favouritesList: {
                    id: movie.id,
                    title: movie.title
                }
            }
        })
        .then( () => {
            toastrConfig.toastClass = "favourites";
            req.toastr.success(`${movie.title} has been added to your Favourites List`, "Success", toastrConfig);

            res.redirect(`/movies/${req.body.movie.id}`)
        })
        .catch( err => {
            res.render("pages/error", {
                message: "Something went wrong"
            })
        })
    } else {
        //If is not on the Favourite List, remove it
        User.updateOne({
            _id:req.session.userId
        },{
            $pull: {
                favouritesList: {
                    id: movie.id,
                    title: movie.title
                }
            }
        })
        .then( () => {
            toastrConfig.toastClass = "favourites";
            req.toastr.success(`${movie.title} has been removed from Favourites List`, "Success", toastrConfig);

            //When deleting from the index list
            if(req.body.movie.remove){                
                res.redirect(`/users/favourites`)
            } else {                
                res.redirect(`/movies/${req.body.movie.id}`)
            }
        })
        .catch( err => {
            res.render("pages/error", {
                message: "Something went wrong"
            })
        })
    }

}

exports.updateWatchList = async (req, res) => {
    await req.isAuthenticated();

    const movie = req.body.movie;

    //Check if movie appears in Watch List - if it doesn't add it, if it does remove it
    const watchListMovie = await User.findById(req.session.userId)
        .then(user => {
            for(let i = 0; i < user.watchList.length; i++){
                if(user.watchList[i].id == movie.id){
                    return user.watchList[i];
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
    
    //If it is not on the Watch List, add it
    if(!watchListMovie){
        User.updateOne({
            _id:req.session.userId
        },{
            $push: {
                watchList: {
                    id: movie.id,
                    title: movie.title
                }
            }
        })
        .then( () => {
            toastrConfig.toastClass = "watchlist";
            req.toastr.success(`${movie.title} has been added to your Watch List`, "Success", toastrConfig);

            res.redirect(`/movies/${req.body.movie.id}`)
        })
        .catch( err => {
            res.render("pages/error", {
                message: "Something went wrong"
            })
        })
    } else {
        //If is not on the Watch List, remove it
        User.updateOne({
            _id:req.session.userId
        },{
            $pull: {
                watchList: {
                    id: movie.id,
                    title: movie.title
                }
            }
        })
        .then( () => {
            toastrConfig.toastClass = "watchlist";
            req.toastr.success(`${movie.title} has been removed from your Watch List`, "Success", toastrConfig);

            if(req.body.movie.remove){
                res.redirect(`/users/watchlist`)
            } else {
                res.redirect(`/movies/${req.body.movie.id}`)
            }
        })
        .catch( err => {
            console.log(err);
            res.render("pages/error", {
                message: "Something went wrong"
            })
        })
    }
}