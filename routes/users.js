const router = require("express").Router()

const usersController = require("../controllers/usersController");

router.get("/new", usersController.new);
router.get("/watchlist", usersController.getWatchList);
router.get("/rated", usersController.getRatedList);
router.get("/favourites", usersController.getFavouritesList);
router.post("/", usersController.create);
router.post("/watchlist", usersController.updateWatchList);
router.post("/favourites", usersController.updateFavouritesList);
router.post("/rated", usersController.updateRatedList);

module.exports = router;