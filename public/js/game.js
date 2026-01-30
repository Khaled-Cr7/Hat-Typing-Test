let testState = null;
const inputField = document.getElementById("input");
const textContainer = document.getElementById("text");

// Check localStorage for saved mode/amount, otherwise use defaults
// 1. Get the saved mode (default to "words")
let currentMode = localStorage.getItem("gameMode") || "words"; 

// 2. Get the saved amount
let savedAmount = localStorage.getItem("gameAmount");

// 3. Logic: If there is a saved amount, use it. 
// If NOT, use the mode's default (15 for time, 25 for words).
let currentAmount;
if (savedAmount) {
    currentAmount = parseInt(savedAmount);
} else {
    currentAmount = (currentMode === "time") ? 15 : 25;
}
let currentText = "";
let timerInterval = null;    
let totalTyped = 0;
// Refocus input whenever user clicks anywhere
document.addEventListener("click", () => inputField.focus());

function startNewGame(amount, reuseText = false) {
  // 1. Update the variable and the UI highlights first
  currentAmount = amount;
  highlightActiveSettings(); // <--- Call it here!

  // 2. Clear existing state
  clearInterval(timerInterval);
  document.querySelector('.main-area').classList.remove('typing');
  document.getElementById("result-modal").classList.add("hidden");
  totalTyped = 0; // Reset accuracy counter

  if (reuseText && currentText) {
    setupGame(currentText);
  } else {
    const fetchCount = (currentMode === "time") ? 100 : currentAmount;
    fetch(`/game/start?length=${fetchCount}`)
      .then(res => res.json())
      .then(data => {
        currentText = data.text;
        setupGame(currentText);
      });
  }
}

function initUser() {
  const name = sessionStorage.getItem('playerName') || 'Guest';
  const best = localStorage.getItem('bestWPM') || 0;
  
  document.getElementById('player-name-label').innerText = name;
  document.getElementById('best-result-label').innerText = `Best: ${best} WPM`;
}

function setupGame(text) {
  testState = createTestState(text);
  if (currentMode === "time") {
    testState.timeLeft = currentAmount;
    updateTimerUI(currentAmount);
  } else {
    updateTimerUI(null);
  }
  inputField.value = "";
  renderText();
}

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentMode = btn.getAttribute('data-mode');
    
    // Reset to defaults when CHANGING modes
    currentAmount = (currentMode === "time") ? 15 : 25;

    // Save both to the "notebook"
    localStorage.setItem("gameMode", currentMode);
    localStorage.setItem("gameAmount", currentAmount);
    
    updateCountButtons();
    startNewGame(currentAmount);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startNewGame(currentAmount, false); 
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevents the browser from clicking a focused button twice
    
    // Reset accuracy and state
    totalTyped = 0; 
    
    // Start fresh test
    startNewGame(currentAmount, false);
  }
});

function updateTimerUI(val) {
  const timerDisplay = document.getElementById("timer-display");
  if (!timerDisplay) return;

  if (currentMode === "words" || val === null) {
    timerDisplay.classList.add("hidden");
  } else {
    timerDisplay.innerText = val;
    timerDisplay.classList.remove("hidden");
  }
}

// Update your updateCountButtons to remove the "s" so math doesn't break
function updateCountButtons() {
  const buttons = document.querySelectorAll('.count-btn');
  // Keep these as pure numbers
  const wordValues = ["10", "25", "50", "100"];
  const timeValues = ["15", "30", "60", "120"]; 
  
  const values = (currentMode === "words") ? wordValues : timeValues;
  
  buttons.forEach((btn, index) => {
    btn.setAttribute('data-value', values[index]);
    btn.innerText = values[index] + (currentMode === "time" ? "s" : "");
  });
}


document.querySelectorAll('.count-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentAmount = parseInt(btn.getAttribute('data-value'));
    
    // SAVE the specific number chosen
    localStorage.setItem("gameAmount", currentAmount);
    
    startNewGame(currentAmount);
  });
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
  // Clear container
  textContainer.innerHTML = "";
  
  let currentWordDiv = document.createElement("div");
  currentWordDiv.className = "word";
  textContainer.appendChild(currentWordDiv);

  testState.chars.forEach((c, i) => {
  const span = document.createElement("span");
  
  // If the character is a space, we give it a special visible character or class
  if (c.char === " ") {
    span.innerHTML = "&nbsp;"; // Non-breaking space
    span.className = "space " + c.status;
  } else {
    span.innerText = c.char;
    span.className = c.status;
  }

  if (i === testState.cursor) span.classList.add("active");

    currentWordDiv.appendChild(span);

    // If this character is a space, start a new "word" container
    if (c.char === " ") {
      currentWordDiv = document.createElement("div");
      currentWordDiv.className = "word";
      textContainer.appendChild(currentWordDiv);
    }
  });

  // Scroll logic
  const activeSpan = document.querySelector('.active');
  if (activeSpan) {
    activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

inputField.addEventListener("keydown", e => {
  if (!testState || testState.finished) return;

  // Add a class to the main area to hide the hint while typing
  document.querySelector('.main-area').classList.add('typing');

  if (!testState.startTime) {
    testState.startTime = Date.now();
    if (currentMode === "time") startTimer();
  }

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

  totalTyped++; // Track every single keypress for accuracy

  if (input === current.char) {
    current.status = "correct";
    testState.correct++;
  } else {
    current.status = "incorrect";
    testState.incorrect++;
  }

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

function startTimer() {
  timerInterval = setInterval(() => {
    testState.timeLeft--;
    updateTimerUI(testState.timeLeft); // Show the time on screen

    if (testState.timeLeft <= 0) {
      clearInterval(timerInterval);
      finishTest();
    }
  }, 1000);
}


function highlightActiveSettings() {
  // Highlight Mode
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === currentMode);
  });

  // Highlight Amount
  document.querySelectorAll('.count-btn').forEach(btn => {
    // We parse both as numbers to ensure they match exactly
    const btnVal = parseInt(btn.getAttribute('data-value'));
    btn.classList.toggle('active', btnVal === currentAmount);
  });
}


function finishTest() {
  clearInterval(timerInterval);
  testState.finished = true;

  const minutes = (Date.now() - testState.startTime) / 60000;
  const wpm = Math.round((testState.correct / 5) / minutes);
  
  // Logic for Best Result
  const savedBest = parseInt(localStorage.getItem('bestWPM') || 0);
  if (wpm > savedBest) {
    localStorage.setItem('bestWPM', wpm);
    document.getElementById('best-result-label').innerText = `Best: ${wpm} WPM`;
  }

  document.getElementById("wpm-result").innerText = wpm;
  document.getElementById("acc-result").innerText = 
    (totalTyped > 0 ? Math.round((testState.correct / totalTyped) * 100) : 0) + "%";
    
  document.getElementById("result-modal").classList.remove("hidden");
}

document.getElementById("restart-btn").addEventListener("click", () => startNewGame(currentAmount, true));
document.getElementById("next-btn").addEventListener("click", () => startNewGame(currentAmount, false));

initUser();
updateCountButtons();
startNewGame(currentAmount);
