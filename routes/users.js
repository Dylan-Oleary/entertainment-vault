const router = require("express").Router()

const usersController = require("../controllers/usersController");

router.get("/new", usersController.new);
router.post("/", usersController.create);
router.post("/watchlist", usersController.updateWatchList);
router.post("/favourites", usersController.updateFavouritesList);
router.post("/rated", usersController.updateRatedList);

module.exports = router;