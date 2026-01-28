let testState = null;

// Fetch text from backend
fetch("/game/start")
  .then(res => res.json())
  .then(data => {
    testState = createTestState(data.text);
    renderText();
  });

function createTestState(text) {
  return {
    chars: text.split("").map(c => ({
      char: c,
      status: "pending"
    })),
    cursor: 0,
    correct: 0,
    incorrect: 0,
    startTime: null,
    finished: false
  };
}

function renderText() {
  const container = document.getElementById("text");
  container.innerHTML = testState.chars
    .map((c, i) => {
      let cls = c.status;
      if (i === testState.cursor) cls += " active";
      return `<span class="${cls}">${c.char}</span>`;
    })
    .join("");
}

document.getElementById("input").addEventListener("keydown", e => {
  if (testState.finished) return;

  if (!testState.startTime) {
    testState.startTime = Date.now();
  }

  if (e.key === "Backspace") {
    handleBackspace();
    renderText();
    return;
  }

  if (e.key.length !== 1) return;

  handleChar(e.key);
  renderText();
});

function handleChar(input) {
  const current = testState.chars[testState.cursor];
  if (!current) return finishTest();

  if (input === current.char) {
    current.status = "correct";
    testState.correct++;
  } else {
    current.status = "incorrect";
    testState.incorrect++;
  }

  testState.cursor++;

  if (testState.cursor === testState.chars.length) {
    finishTest();
  }
}

function handleBackspace() {
  if (testState.cursor === 0) return;

  testState.cursor--;
  const char = testState.chars[testState.cursor];

  if (char.status === "correct") testState.correct--;
  if (char.status === "incorrect") testState.incorrect--;

  char.status = "pending";
}

function finishTest() {
  testState.finished = true;
  const minutes = (Date.now() - testState.startTime) / 60000;
  const wpm = Math.round((testState.correct / 5) / minutes);
  alert(`WPM: ${wpm}`);
}
