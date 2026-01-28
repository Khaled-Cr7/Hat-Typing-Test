const { generateTypingWords } = require("../services/wordGenerator");

exports.startGame = (req, res) => {
  try {
    // You can now pass a length via query: /game/start?length=50
    const wordCount = parseInt(req.query.length) || 25;
    const text = generateTypingWords(wordCount);
    
    if (!text) {
      return res.status(500).json({ error: "Could not generate words" });
    }

    res.json({ text });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};