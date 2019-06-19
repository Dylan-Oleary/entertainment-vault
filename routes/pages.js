const router = require("express").Router();

const pagesController = require("../controllers/pagesController");

router.get(`/`, pagesController.show);
router.get(`/show`, pagesController.show);
router.get(`/new`, pagesController.show);
router.get(`/edit`, pagesController.show);
router.get(`/about`, pagesController.show);
router.get(`/contact`, pagesController.show);

module.exports = router;