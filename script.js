// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnTimer;             // Holds the timer for spawning items

// Creates the 3x3 game grid where items will appear
function createGrid() {
  // Get the container element for the grid
  const grid = document.querySelector('.game-grid');
  // Clear any existing grid cells
  grid.innerHTML = '';
  // Create 9 cells (3x3 grid)
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear any existing items from all cells
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerHTML = '';
  }

  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  
  // Create wrapper for proper positioning
  const wrapper = document.createElement('div');
  wrapper.className = 'water-can-wrapper';
  
  // Create the item element
  const waterCan = document.createElement('div');
  waterCan.className = 'water-can';
  
  // Add item to wrapper
  wrapper.appendChild(waterCan);
  
  // Add click handler to just remove the item
  wrapper.onclick = () => {
    if (gameActive) {
      wrapper.remove();
    }
  };
  
  // Add the wrapped item to the random cell
  randomCell.appendChild(wrapper);
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return;
  gameActive = true;
  createGrid();
  spawnTimer = setInterval(spawnWaterCan, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(spawnTimer);
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
