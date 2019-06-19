const Movie = require("../models/movie");
const tmdb = require("../apis/tmdb");
const genreFormatter = require("../utils/genreFormatter");
const User = require("../models/user");

exports.confirm = (req, res) => {
    //We search the API for movies with the title, we get back an Array
    tmdb.get("search/movie", {
        params: {
            api_key: process.env.TMDB_KEY,
            language: "en-US",
            query: req.body.movie.title.toLowerCase(),
            page: 1,
            include_adult: false
        }
    }).then( response => {
        if (response.data.results.length === 0){
            res.render("pages/error", {
                message: `We couldn't find anything that goes by the name ${req.body.movie.title}, try searching again!`
            })
        }else {
            res.render("movies/confirm", {
                movies: response.data.results
            })
        }
    })
}

exports.create = async (req, res) => {
    await req.isAuthenticated();

    //Check if the tmdb_id exists in our movie DB
    const dbMovie = await Movie.findOne({
        tmdb_id: req.body.movie.tmdb_id
    })

    //If it doesn't, create the record
    if (!dbMovie){
        const response = await tmdb.get(`movie/${req.body.movie.tmdb_id}`, {
            params: {
                api_key: process.env.TMDB_KEY,
                movie_id: req.body.movie.tmdb_id,
                language: "en-US",
                append_to_response: "credits"
            }
        }).catch(err => {
            console.log("Woops")
        })

        Movie.create({
            backdrop_path: response.data.backdrop_path,
            budget: response.data.budget,
            cast: response.data.credits.cast,
            crew: response.data.credits.crew,
            genres: response.data.genres,
            overview: response.data.overview,
            poster_path: response.data.poster_path,
            production_companies: response.data.production_companies,
            release_date: response.data.release_date,
            runtime: response.data.runtime,
            status: response.data.status,
            tagline: response.data.tagline,
            title: response.data.title,
            tmdb_id: response.data.id
        })
        .then( movie => {
            req.flash("success", "Movie entered successfully");
            res.redirect(`/movies/${movie._id}`)
        })
        .catch( err => {
            console.log(err);
            req.flash("error", `ERROR: ${err}`);
            res.render("pages/error", {
                message: "It looks like you don't have any movies in your list, try searching for some!"
            })
        })
    } else {
        //If it does, re-direct and don't call API
        res.redirect(`/movies/${dbMovie._id}`)
    }
};

exports.destroy = (req, res) => {
    req.isAuthenticated();

    Movie.deleteOne({
        _id: req.body.id
    })
    .then( () => {
        req.flash("success", "Movie deleted succuessfully");
        res.redirect("/movies")
    })
    .catch( err => {
        req.flash("error", `ERROR: ${err}`);
        res.redirect("/movies");
    })
}

exports.edit = (req, res) => {
    req.isAuthenticated();

    Movie.findById(req.params.id)
        .then( movie => {
            res.render("movies/edit", {
                title: "Edit Movie",
                movie: movie
            })
        })
        .catch(err => {
            req.flash("error", `ERROR: ${err}`);
            res.redirect("/movies");
        });
}

exports.index = (req, res) => {
    req.isAuthenticated();

    Movie.find({
        user: req.session.userId
    })
        .then(movies => {
            if(movies.length === 0){
                res.render("pages/error", {
                    message: "It looks like you don't have any movies in your list, try searching for some!"
                })
            }else {
                res.render("movies/index", {
                    movies: movies,
                    title: "Movie List",
                    route: req.path
                })
            }
        })
        .catch(err => {
            req.flash("error", `ERROR: ${err}`);
            res.redirect("/movies");
        });
};

exports.show = (req, res) => {
    const movie = Movie.findById(req.params.id).then(movie => movie)

    const user = User.findById(req.session.userId).then(user => user)

    Promise.all([movie, user])
    .then( values => {
        let movie = values[0];
        let userLists = [
            values[1].watchList,
            values[1].favouritesList,
            values[1].ratedList
        ]

        const user = {
            onWatchList: false,
            onFavouritesList: false,
            onRated: {
                status: false,
                rating: null
            }
        }

        //Check if the movie is on either of the 3 lists
        userLists[0].filter(watchListMovie => {
            watchListMovie.id == movie._id ? user.onWatchList = true : null
        })

        userLists[1].filter(favouritesListMovie => {
            favouritesListMovie.id == movie._id ? user.onFavouritesList = true : null
        })

        userLists[2].filter(ratedListMovie => {
            if(ratedListMovie.id == movie.id){
                user.onRated.status = true;
                user.onRated.rating = ratedListMovie.rating
            }
        })

        const genres = genreFormatter.formatGenres(movie.genres);
        movie.genres = genres;

        res.render("movies/show", {
            movie: movie,
            user: user
        })
    })
    .catch( err => {
        res.render("pages/error", {
            message: "Your watch list is empty, try searching for some movies to populate it with"
        });
    })
}

exports.update = (req, res) => {
    req.isAuthenticated();

    Movie.updateOne({
        _id: req.body.movie.id
    },{
        on_watchlist: req.body.movie.on_watchlist
        // on_favourite_list: req.body.movie.on_favourite_list,
        // rating: req.body.movie.rating
    },{
        runValidators: true
    })
    .then( () => {
        req.flash("success", "Movie was updated successfully");
        res.redirect(`/movies/${req.body.movie.id}`)
    })
    .catch( err => {
        req.flash("error", `ERROR: ${err}`);
        res.render("movies/edit", {
            movie: req.body.movie,
            title: "Edit Movie"
        })
    })
};