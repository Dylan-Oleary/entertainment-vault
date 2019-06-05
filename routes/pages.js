const router = require("express").Router();

const pagesController = require("../controllers/pagesController");

router.get(`/`, pagesController.show);
router.get(`/show`, pagesController.show);
router.get(`/new`, pagesController.show);
router.get(`/edit`, pagesController.show);
router.get(`/search`, pagesController.show);

module.exports = router;