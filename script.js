// Game state
const GOAL_CANS = 25;
let currentCans = 0;
let timeLeft = 30;
let gameActive = false;
let spawnIntervalId = null;
let timerIntervalId = null;
let milestoneShown = false;

// Difficulty
let currentDifficulty = 'medium';
const difficultySettings = {
  easy:   { spawnInterval: 1500, itemDuration: 2500 },
  medium: { spawnInterval: 1000, itemDuration: 2000 },
  hard:   { spawnInterval: 600,  itemDuration: 1200 }
};

// Audio setup - using Web Audio API to generate simple sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  const now = audioContext.currentTime;
  
  switch(type) {
    case 'collect': // Water can collected - positive beep
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;
      
    case 'bomb': // Bomb clicked - negative buzz
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;
      
    case 'milestone': // Halfway milestone - cheerful melody
      const frequencies = [523, 659, 784]; // C, E, G chord
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now + i * 0.1);
        osc.stop(now + 0.4 + i * 0.1);
      });
      break;
      
    case 'win': // Game won - victory fanfare
      const winNotes = [523, 659, 784, 1047]; // C, E, G, high C
      winNotes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now + i * 0.15);
        osc.stop(now + 0.3 + i * 0.15);
      });
      break;
      
    case 'timeout': // Time's up - descending tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
      break;
  }
}

// Show milestone message
function showMilestone(message) {
  const milestone = document.createElement('div');
  milestone.className = 'milestone-message';
  milestone.textContent = message;
  document.body.appendChild(milestone);
  
  setTimeout(() => {
    milestone.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    milestone.classList.remove('show');
    setTimeout(() => milestone.remove(), 300);
  }, 2000);
}

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

// Spawn logic
function spawnItemOnce() {
  const settings = difficultySettings[currentDifficulty];
  const cells = Array.from(document.querySelectorAll('.grid-cell'));
  const empty = cells.filter(c => !c.firstChild);
  if (empty.length === 0) return;

  const cell = empty[Math.floor(Math.random() * empty.length)];
  const isBomb = Math.random() < 0.25;

  const wrapper = document.createElement('div');
  wrapper.className = isBomb ? 'bomb-wrapper' : 'water-can-wrapper';

  const item = document.createElement('div');
  item.className = isBomb ? 'bomb' : 'water-can';

  item.addEventListener('click', () => {
    if (!gameActive) return;
    if (isBomb) {
      currentCans = Math.max(0, currentCans - 1);
      flashCell(cell, '#F5402C');
      playSound('bomb');
    } else {
      currentCans += 1;
      flashCell(cell, '#3CCB5D');
      playSound('collect');
      
      // Check for milestone
      if (currentCans === 10 && !milestoneShown) {
        milestoneShown = true;
        playSound('milestone');
        showMilestone('🎉 Halfway there! Keep going!');
      }
    }
    updateHUD();
    wrapper.remove();
  });

  wrapper.appendChild(item);
  cell.appendChild(wrapper);

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
  milestoneShown = false;
  updateHUD();

  showScreen('game-screen');
  createGrid();

  spawnItemOnce();
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
  
  if (currentCans >= 20) {
    endMessageEl.textContent = "🎉 Amazing! You're a Water Champion!";
    playSound('win');
    showConfetti();
  } else if (currentCans >= 10) {
    endMessageEl.textContent = "👏 Great job! Keep it up!";
    playSound('timeout');
  } else {
    endMessageEl.textContent = "💧 Good try! Play again?";
    playSound('timeout');
  }

  showScreen('end-screen');
}

function clearIntervals() {
  if (spawnIntervalId) clearInterval(spawnIntervalId);
  if (timerIntervalId) clearInterval(timerIntervalId);
  spawnIntervalId = null;
  timerIntervalId = null;
}

// Confetti function
function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
    container.appendChild(confetti);
  }
  
  setTimeout(() => container.remove(), 3000);
}

// Events
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => showScreen('start-screen'));