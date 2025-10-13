// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = 30;           // Seconds left in the game

// Creates the 9x9 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 81; i++) { // 81 cells (9x9 grid)
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnItem() {
  if (!gameActive) return;
  const grid = document.querySelector('.game-grid');
  const gridCells = grid.querySelectorAll('.grid-cell');
  gridCells.forEach(cell => {
    cell.innerHTML = '';
    const item = Math.random() < 0.2 ? 'bomb' : 'can'; // 20% bomb, 80% can
  if (item === 'bomb') {
      cell.innerHTML = `
        <div class="bomb-wrapper">
          <div class="bomb"></div>
        </div>
      `;
      const bomb = cell.querySelector('.bomb');
      bomb.addEventListener('click', function handleBombClick(e) {
        if (!gameActive) return;
        currentCans = Math.max(0, currentCans - 1);
        document.getElementById('current-cans').textContent = currentCans;
        cell.innerHTML = '';
      }, { once: true });
    } else {
      console.log('Water can generated in cell:', cell);
      cell.innerHTML = `
        <div class="water-can-wrapper">
          <div class="water-can"></div>
        </div>
      `;
      const can = cell.querySelector('.water-can');
      can.addEventListener('click', function handleCanClick(e) {
        if (!gameActive) return;
        currentCans++;
        document.getElementById('current-cans').textContent = currentCans;
        cell.innerHTML = '';
      }, { once: true });
    }
  });
}

// Function to start the game
function startGame() {
  if (gameActive) return;
  gameActive = true;
  currentCans = 0;
  timeLeft = 30;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
  createGrid();
  showScreen('game-screen');
  
  // Fill the grid with items every second
  spawnInterval = setInterval(spawnItem, 1000);

  // Timer countdown
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Function to end the game
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

// Utility function to show the correct screen
function showScreen(screenId) {
  const screens = ['start-screen', 'game-screen', 'end-screen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}
