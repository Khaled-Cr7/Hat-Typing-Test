const express = require("express");
const router = express.Router();
const gameController = require("../controller/gameController");

router.get("/", gameController.renderGamePage);
router.get("/start", gameController.startGame);

module.exports = router;
