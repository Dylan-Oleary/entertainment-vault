const User = require("../models/user");
const Movie = require("../models/movie");

exports.create = (req, res) => {
    User.create(req.body.user)
    .then(() => {
        req.flash('success', "You are now registered");
        res.redirect("/login");
    })
    .catch( err => {
        req.flash("error", `ERROR: ${err}`);
        res.redirect("users/new", {
            message: "It looks like you don't have any movies in your list, try searching for some!"
        })
    })
};

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
            res.render("movies/index", {
                movies: movies,
                path: req.path
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
                path: req.path
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
                path: req.path
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
            req.flash("success", "Movie was updated successfully");
            res.redirect(`/movies/${req.body.movie.id}`)
        })
        .catch( err => {
            console.log(err);
            req.flash("error", `ERROR: ${err}`);
            res.render("movies/edit", {
                movie: req.body.movie,
                title: "Edit Movie"
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
                req.flash("success", "Movie was updated successfully");
                res.redirect(`/movies/${req.body.movie.id}`)
            })
            .catch( err => {
                console.log(err);
                req.flash("error", `ERROR: ${err}`);
                res.render("movies/edit", {
                    movie: req.body.movie,
                    title: "Edit Movie"
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
                if(req.body.user.action){
                    req.flash("success", "Movie was updated successfully");
                    res.redirect(`/users/rated`)
                } else {
                    req.flash("success", "Movie was updated successfully");
                    res.redirect(`/movies/${req.body.movie.id}`)
                }
            })
            .catch( err => {
                console.log(err);
                req.flash("error", `ERROR: ${err}`);
                res.render("movies/edit", {
                    movie: req.body.movie,
                    title: "Edit Movie"
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
            req.flash("success", "Movie was updated successfully");
            res.redirect(`/movies/${req.body.movie.id}`)
        })
        .catch( err => {
            console.log(err);
            req.flash("error", `ERROR: ${err}`);
            res.render("movies/edit", {
                movie: req.body.movie,
                title: "Edit Movie"
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
            if(req.body.user.action){
                req.flash("success", "Movie was updated successfully");
                res.redirect(`/users/favourites`)
            } else {
                req.flash("success", "Movie was updated successfully");
                res.redirect(`/movies/${req.body.movie.id}`)
            }
        })
        .catch( err => {
            console.log(err);
            req.flash("error", `ERROR: ${err}`);
            res.render("movies/edit", {
                movie: req.body.movie,
                title: "Edit Movie"
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
            req.flash("success", "Movie was updated successfully");
            res.redirect(`/movies/${req.body.movie.id}`)
        })
        .catch( err => {
            console.log(err);
            req.flash("error", `ERROR: ${err}`);
            res.render("movies/edit", {
                movie: req.body.movie,
                title: "Edit Movie"
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
            if(req.body.user.action){
                req.flash("success", "Movie was updated successfully");
                res.redirect(`/users/watchlist`)
            } else {
                req.flash("success", "Movie was updated successfully");
                res.redirect(`/movies/${req.body.movie.id}`)
            }
        })
        .catch( err => {
            console.log(err);
            req.flash("error", `ERROR: ${err}`);
            res.render("movies/edit", {
                movie: req.body.movie,
                title: "Edit Movie"
            })
        })
    }
}