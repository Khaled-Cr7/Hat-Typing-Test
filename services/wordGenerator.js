const { generate } = require("random-words");

function generateTypingWords(count = 25) {
  return generate({
    exactly: count,
    maxLength: 7,
    join: " "
  });
}

module.exports = { generateTypingWords };
