// Game state
const GOAL_CANS = 25;
let currentCans = 0;
let timeLeft = 30;
let gameActive = false;
let spawnIntervalId = null;
let timerIntervalId = null;

// Difficulty
let currentDifficulty = 'medium';
const difficultySettings = {
  easy:   { spawnInterval: 1500, itemDuration: 2500 },
  medium: { spawnInterval: 1000, itemDuration: 2000 },
  hard:   { spawnInterval: 600,  itemDuration: 1200 }
};

// DOM
const startScreen   = document.getElementById('start-screen');
const gameScreen    = document.getElementById('game-screen');
const endScreen     = document.getElementById('end-screen');
const startBtn      = document.getElementById('start-game');
const playAgainBtn  = document.getElementById('play-again');
const gameGrid      = document.querySelector('.game-grid');
const currentCansEl = document.getElementById('current-cans');
const timerEl       = document.getElementById('timer');
const finalScoreEl  = document.getElementById('final-score');
const endMessageEl  = document.getElementById('end-message');

// Difficulty buttons
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    difficultyButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDifficulty = btn.dataset.difficulty;

    // If game is running, apply new spawn speed immediately
    if (gameActive) {
      resetSpawnLoop();
    }
  });
});

// Grid
function createGrid() {
  gameGrid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    gameGrid.appendChild(cell);
  }
}

// Spawn exactly one item per tick into a random empty cell
function spawnItemOnce() {
  const settings = difficultySettings[currentDifficulty];
  const cells = Array.from(document.querySelectorAll('.grid-cell'));
  const empty = cells.filter(c => !c.firstChild);
  if (empty.length === 0) return;

  const cell = empty[Math.floor(Math.random() * empty.length)];
  const isBomb = Math.random() < 0.25; // 25% chance of bomb

  const wrapper = document.createElement('div');
  wrapper.className = isBomb ? 'bomb-wrapper' : 'water-can-wrapper';

  const item = document.createElement('div');
  item.className = isBomb ? 'bomb' : 'water-can';

  item.addEventListener('click', () => {
    if (!gameActive) return;
    if (isBomb) {
      currentCans = Math.max(0, currentCans - 1); // -1 per bomb
      flashCell(cell, '#F5402C');
    } else {
      currentCans += 1; // +1 per can
      flashCell(cell, '#3CCB5D');
    }
    updateHUD();
    wrapper.remove();
  });

  wrapper.appendChild(item);
  cell.appendChild(wrapper);

  // Auto-remove after item duration
  setTimeout(() => {
    if (wrapper.parentNode) wrapper.remove();
  }, settings.itemDuration);
}

function resetSpawnLoop() {
  if (spawnIntervalId) clearInterval(spawnIntervalId);
  const settings = difficultySettings[currentDifficulty];
  spawnIntervalId = setInterval(spawnItemOnce, settings.spawnInterval);
}

// UI helpers
function updateHUD() {
  currentCansEl.textContent = currentCans;
  timerEl.textContent = timeLeft;
}

function showScreen(id) {
  [startScreen, gameScreen, endScreen].forEach(el => {
    el.classList.toggle('hidden', el.id !== id);
  });
}

function flashCell(cell, color) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.borderRadius = '12px';
  overlay.style.background = color + '33';
  overlay.style.pointerEvents = 'none';
  cell.style.position = 'relative';
  cell.appendChild(overlay);
  setTimeout(() => overlay.remove(), 150);
}

// Game flow
function startGame() {
  if (gameActive) return;

  clearIntervals();
  currentCans = 0;
  timeLeft = 30;
  gameActive = true;
  updateHUD();

  showScreen('game-screen');
  createGrid();

  // Start spawning and timer
  spawnItemOnce(); // immediate spawn
  resetSpawnLoop();

  timerIntervalId = setInterval(() => {
    timeLeft--;
    updateHUD();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (!gameActive) return;
  gameActive = false;
  clearIntervals();

  finalScoreEl.textContent = currentCans;
  endMessageEl.textContent =
    currentCans >= GOAL_CANS ? '🎉 Amazing! You hit the goal!' :
    currentCans >= Math.ceil(GOAL_CANS * 0.5) ? '👏 Great job! Keep it up!' :
    '💧 Good try! Play again?';

  showScreen('end-screen');
}

function clearIntervals() {
  if (spawnIntervalId) clearInterval(spawnIntervalId);
  if (timerIntervalId) clearInterval(timerIntervalId);
  spawnIntervalId = null;
  timerIntervalId = null;
}

// Events
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => showScreen('start-screen'));

// Confetti
function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.backgroundColor = `hsl(${Math.floor(Math.random()*360)},100%,60%)`;
    container.appendChild(c);
  }
  setTimeout(() => container.remove(), 2600);
}