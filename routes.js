const express = require("express");
const app = express();

const pageRoutes = require("./routes/pages");
const movieRoutes = require("./routes/movies");
const userRoutes = require("./routes/users");
const sessionsRoutes = require("./routes/sessions");

app.use("/", pageRoutes);
app.use("/movies", movieRoutes);
app.use("/users", userRoutes);
app.use("/", sessionsRoutes);

module.exports = app;