const express = require("express");
const router = express.Router();
const gameController = require("../controller/gameController");

// Route to render the actual typing test page
router.get("/", (req, res) => {
    res.render("Game");
});

// API Route to get the words for the test
// The error was likely here; ensure it uses gameController.startGame
router.get("/start", gameController.startGame);

module.exports = router;
