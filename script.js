// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnTimer;             // Holds the timer for spawning items

// Updates the progress bar and item count display
function updateProgress() {
  // Calculate percentage of progress (0-100)
  const progress = (currentCans / GOAL_CANS) * 100;
  // Update progress bar width to show progress
  document.getElementById('progress-bar').style.width = progress + '%';
  // Update the numerical display of items collected
  document.getElementById('current-cans').textContent = currentCans;
}

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
  // Only spawn if game is active
  if (!gameActive) return;
  // Get all grid cells
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear any existing items from all cells
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerHTML = '';
  }

  // Choose a random cell for the new item
  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  
  // Create wrapper for proper positioning
  const wrapper = document.createElement('div');
  wrapper.className = 'water-can-wrapper';
  
  // Create the item element
  const waterCan = document.createElement('div');
  waterCan.className = 'water-can';
  
  // Add item to wrapper
  wrapper.appendChild(waterCan);
  
  // Add click handler to collect item
  wrapper.onclick = () => {
    if (gameActive) {
      currentCans++;
      updateProgress();
      wrapper.remove();
    }
  };
  
  // Add the wrapped item to the random cell
  randomCell.appendChild(wrapper);
}

// Initializes and starts a new game
function startGame() {
  // Prevent starting if game is already running
  if (gameActive) return;
  
  // Set up initial game state
  gameActive = true;
  currentCans = 0;
  
  // Reset UI elements
  updateProgress();
  createGrid();
  
  // Start spawning items every second
  spawnTimer = setInterval(spawnWaterCan, 1000);
}

// Basic game state reset function - students can expand this
function endGame() {
  gameActive = false;
  clearInterval(spawnTimer);
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
