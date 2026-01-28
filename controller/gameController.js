const { generateTypingWords } = require("../services/wordGenerator");

exports.startGame = (req, res) => {
  const text = generateTypingWords(25);
  res.json({ text });
};

exports.renderGamePage = (req, res) => {
  res.render("Game");
};
