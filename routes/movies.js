const router = require("express").Router();
const moviesController = require("../controllers/moviesController");

router.get(`/`, moviesController.index);
router.get(`/:id`, moviesController.show);
router.post(`/confirm`, moviesController.confirm);
router.post(`/`, moviesController.create);
router.get(`/:id/edit`, moviesController.edit);
router.post(`/update`, moviesController.update);
router.post(`/destroy`, moviesController.destroy);

module.exports = router;