const router = require("express").Router();

const sessionsController = require("../controllers/sessionsController");

router.get("/login", sessionsController.login);
router.post("/authenticate", sessionsController.authenticate);
router.post("/logout", sessionsController.logout);

module.exports = router;