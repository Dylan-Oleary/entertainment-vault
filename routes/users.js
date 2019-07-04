const router = require("express").Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const usersController = require("../controllers/usersController");

router.get("/new", usersController.new);
router.get("/watchlist", usersController.getWatchList);
router.get("/rated", usersController.getRatedList);
router.get("/favourites", usersController.getFavouritesList);
router.get("/account", usersController.account);
router.post("/", usersController.create);
router.post("/delete", usersController.delete);
router.post("/update", upload.single("user[profilePicture]"), usersController.updateUser);
router.post("/watchlist", usersController.updateWatchList);
router.post("/favourites", usersController.updateFavouritesList);
router.post("/rated", usersController.updateRatedList);

module.exports = router;