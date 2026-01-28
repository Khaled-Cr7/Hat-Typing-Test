let testState = null;
const inputField = document.getElementById("input");
const textContainer = document.getElementById("text");

// Refocus input whenever user clicks anywhere
document.addEventListener("click", () => inputField.focus());

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
  textContainer.innerHTML = testState.chars
    .map((c, i) => {
      let cls = c.status;
      if (i === testState.cursor) cls += " active";
      return `<span class="${cls}">${c.char}</span>`;
    })
    .join("");

  // Logic to "go down" (scroll) as user types
  const activeSpan = document.querySelector('.active');
  if (activeSpan) {
    activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

inputField.addEventListener("keydown", e => {
  if (!testState || testState.finished) return;

  if (!testState.startTime) testState.startTime = Date.now();

  if (e.key === "Backspace") {
    handleBackspace();
  } else if (e.key.length === 1) {
    handleChar(e.key);
  }
  
  renderText();
});

function handleChar(input) {
  const current = testState.chars[testState.cursor];
  if (!current) return;

  current.status = (input === current.char) ? "correct" : "incorrect";
  if (current.status === "correct") testState.correct++;
  else testState.incorrect++;

  testState.cursor++;
  if (testState.cursor === testState.chars.length) finishTest();
}

function handleBackspace() {
  if (testState.cursor === 0) return;
  testState.cursor--;
  const char = testState.chars[testState.cursor];
  if (char.status === "correct") testState.correct--;
  else if (char.status === "incorrect") testState.incorrect--;
  char.status = "pending";
}

function finishTest() {
  testState.finished = true;
  const minutes = (Date.now() - testState.startTime) / 60000;
  const wpm = Math.round((testState.correct / 5) / minutes);
  alert(`Test Finished! WPM: ${wpm}`);
}