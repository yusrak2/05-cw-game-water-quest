// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = 30;           // Seconds left in the game

// Difficulty settings
let currentDifficulty = 'medium';
const difficultySettings = {
  easy: {
    spawnInterval: 1500,  // milliseconds between spawns
    itemDuration: 2500    // how long items stay visible
  },
  medium: {
    spawnInterval: 1000,
    itemDuration: 2000
  },
  hard: {
    spawnInterval: 600,
    itemDuration: 1500
  }
};

// Handle difficulty selection
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    difficultyButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDifficulty = btn.dataset.difficulty;
  });
});

// Creates the 9x9 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  
  // Create 3x3 grid (9 cells)
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

// Spawns a new item in a random grid cell
function spawnItems() {
  const grid = document.querySelector('.game-grid');
  const gridCells = grid.querySelectorAll('.grid-cell');
  const settings = difficultySettings[currentDifficulty];

  gridCells.forEach(cell => {
    cell.innerHTML = ''; // Clear any previous item

    // Randomly choose between water can (80%) or bomb (20%)
    const item = Math.random() < 0.2 ? 'bomb' : 'can'; // 20% bomb, 80% can

    if (item === 'bomb') {
      // Create bomb item
      const bombWrapper = document.createElement('div');
      bombWrapper.className = 'bomb-wrapper';
      
      const bomb = document.createElement('div');
      bomb.className = 'bomb';
      bomb.addEventListener('click', () => {
        currentCans = Math.max(0, currentCans - 5);
        document.getElementById('current-cans').textContent = currentCans;
        bombWrapper.remove();
      });
      
      bombWrapper.appendChild(bomb);
      cell.appendChild(bombWrapper);
      
      // Auto-remove after duration
      setTimeout(() => {
        if (bombWrapper.parentNode) {
          bombWrapper.remove();
        }
      }, settings.itemDuration);
      
    } else {
      // Create water can item
      const canWrapper = document.createElement('div');
      canWrapper.className = 'water-can-wrapper';
      
      const can = document.createElement('div');
      can.className = 'water-can';
      can.addEventListener('click', () => {
        currentCans++;
        document.getElementById('current-cans').textContent = currentCans;
        canWrapper.remove();
      });
      
      canWrapper.appendChild(can);
      cell.appendChild(canWrapper);
      
      // Auto-remove after duration
      setTimeout(() => {
        if (canWrapper.parentNode) {
          canWrapper.remove();
        }
      }, settings.itemDuration);
    }
  });
}

// Function to start the game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active

  // Reset game state
  currentCans = 0;
  timeLeft = 30;
  gameActive = true;

  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;

  // Show the game screen and hide the start screen
  showScreen('game-screen');

  // Create the grid once the game starts
  createGrid();

  // Get difficulty settings
  const settings = difficultySettings[currentDifficulty];

  // Start spawning items based on difficulty
  spawnInterval = setInterval(spawnItems, settings.spawnInterval);

  // Start the timer countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// End the game and show the end screen
function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.getElementById('final-score').textContent = currentCans;
  if (currentCans > 20) {
    document.getElementById('end-message').textContent = 'You win!';
    showConfetti();
  } else {
    document.getElementById('end-message').textContent = 'Try again :('; 
  }
  showScreen('end-screen');
}

// Play again button handler
document.getElementById('play-again').addEventListener('click', () => {
  showScreen('start-screen');
});

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Show confetti animation
function showConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = `hsl(${Math.random()*360},100%,60%)`;
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2500);
  }
  setTimeout(() => confettiContainer.remove(), 3000);
}

// Utility function to show the correct screen
function showScreen(screenId) {
  const screens = ['start-screen', 'game-screen', 'end-screen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle('hidden', id !== screenId);
    }
  });
}