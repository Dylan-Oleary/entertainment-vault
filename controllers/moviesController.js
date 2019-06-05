const Movie = require("../models/movie");
const tmdb = require("../apis/tmdb");

exports.confirm = (req, res) => {
    tmdb.get("search/movie", {
        params: {
            api_key: process.env.TMDB_KEY,
            language: "en-US",
            query: req.body.movie.title.toLowerCase(),
            page: 1,
            include_adult: false
        }
    }).then( response => {
        res.render("movies/confirm", {
            movies: response.data.results
        })
    })
}

exports.create = (req, res) => {
    Movie.create({
        title: req.body.movie.title,
        rating: req.body.movie.rating,
        poster_path: req.body.movie.poster_path,
        release_date: req.body.movie.release_date,
        overview: req.body.movie.overview
        })
        .then( () => {
            req.flash("success", "Movie entered successfully");
            res.redirect("movies")
        })
        .catch( err => {
            req.flash("error", `ERROR: ${err}`);
            res.render("movies/new", {
                movie: req.body.movie,
                title: "Enter a movie"
            })
        })
};

exports.destroy = (req, res) => {
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

exports.drafts = (req, res) => {
    Movie.find().drafts()
        .then( movies => {
            res.render("movies/index", {
                movies: movies,
                title: "Published Movies"
            })
        })
        .catch(err => {
            req.flash("error", `ERROR: ${err}`);
            res.redirect("/movies");
        });
}

exports.edit = (req, res) => {
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
    Movie.find()
        .then(movies => {
            res.render("movies/index", {
                movies: movies,
                title: "Movie List"
            })
        })
        .catch(err => {
            req.flash("error", `ERROR: ${err}`);
            res.redirect("/movies");
        });
};

exports.new = (req, res) => {
    res.render("movies/new", {
        title: "New Movie Post"
    });
};

exports.published = (req, res) => {
    Movie.find().published()
    .then( movies => {
        res.render("movies/index", {
            movies: movies,
            title: "Published Movies"
        })
    })
    .catch(err => {
        req.flash("error", `ERROR: ${err}`);
        res.redirect("/movies");
    });
}

exports.show = (req, res) => {
    Movie.findById(req.params.id)
        .then( movie => {
            res.render("movies/show", {
                title: movie.title,
                movie: movie
            })
        })
        .catch( err => console.log(`Error: ${err}`) );
}

exports.update = (req, res) => {
    Movie.updateOne({
        _id: req.body.id
    },{
        rating: req.body.movie.rating
    },{
        runValidators: true
    })
    .then( () => {
        req.flash("success", "Movie was updated successfully");
        res.redirect("/movies")
    })
    .catch( err => {
        req.flash("error", `ERROR: ${err}`);
        res.render("movies/edit", {
            movie: req.body.movie,
            title: "Edit Movie"
        })
    })
};