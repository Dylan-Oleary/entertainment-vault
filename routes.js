const express = require("express");
const app = express();

const pageRoutes = require("./routes/pages");
const movieRoutes = require("./routes/movies");

app.use("/", pageRoutes);
app.use("/movies", movieRoutes);

module.exports = app;