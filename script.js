// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;          // Holds the interval for the timer
let timeLeft = 30;          // Seconds left in the game

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Decide randomly: 70% chance for can, 30% for bomb
  const isBomb = Math.random() < 0.3;
  if (isBomb) {
    randomCell.innerHTML = `
      <div class="bomb-wrapper">
        <div class="bomb"></div>
      </div>
    `;
    const bomb = randomCell.querySelector('.bomb');
    if (bomb) {
      bomb.addEventListener('click', function handleBombClick(e) {
        if (!gameActive) return;
        currentCans = Math.max(0, currentCans - 1);
        document.getElementById('current-cans').textContent = currentCans;
        bomb.style.pointerEvents = 'none';
      }, { once: true });
    }
  } else {
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-can"></div>
      </div>
    `;
    // Add click event for the can
    const can = randomCell.querySelector('.water-can');
    if (can) {
      can.addEventListener('click', function handleCanClick(e) {
        if (!gameActive) return;
        currentCans++;
        document.getElementById('current-cans').textContent = currentCans;
        // Prevent further clicks on this can
        can.style.pointerEvents = 'none';
      }, { once: true });
    }
  }
}


function showScreen(screenId) {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  currentCans = 0;
  timeLeft = 30;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
  createGrid();
  showScreen('game-screen');
  spawnInterval = setInterval(spawnWaterCan, 1000);
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.getElementById('final-score').textContent = currentCans;
  const endMessage = document.getElementById('end-message');
  endMessage.textContent = currentCans >= 20 ? 'You brought clean water! 💧' : 'Try Again!';
  showScreen('end-screen');
  showConfetti();
}

function showConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);
  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = (Math.random() * 2) + 's';
    confetti.style.backgroundColor = [
      '#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A', '#F5402C', '#159A48', '#F16061'
    ][Math.floor(Math.random() * 8)];
    confettiContainer.appendChild(confetti);
  }
  setTimeout(() => {
    confettiContainer.remove();
  }, 4000);
}
function showScreen(screenId) {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');
}

function startGame() {
  showScreen('game-screen');
  // ... keep your existing code here ...
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.getElementById('final-score').textContent = currentCans;
  const endMessage = document.getElementById('end-message');
  endMessage.textContent = currentCans >= 20 ? 'You brought clean water! 💧' : 'Try Again!';
  showScreen('end-screen');
}

// Play again button
document.getElementById('play-again').addEventListener('click', () => {
  currentCans = 0;
  timeLeft = 30;
  document.getElementById('current-cans').textContent = 0;
  document.getElementById('timer').textContent = 30;
  showScreen('start-screen');
  gameActive = false;
});

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
