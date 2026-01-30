const express = require("express");
const router = express.Router();
const gameController = require("../controller/gameController");

// Route to render the actual typing test page
router.get("/", (req, res) => {
    res.render("Game");
});


router.get("/start", gameController.startGame);

module.exports = router;
