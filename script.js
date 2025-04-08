const GOAL_CANS = 25;
let currentCans = 0;
let level = 1;
let achievements = [];
let gameActive = false;

let timeLeft = 30;
let gameTimer;
let spawnTimer;

const LEVELS = {
  1: { name: "Water Novice", threshold: 20 },
  2: { name: "Village Helper", threshold: 40 },
  3: { name: "Water Guardian", threshold: 60 },
  4: { name: "Hydro Hero", threshold: 80 },
  5: { name: "Water Legend", threshold: 100 }
};

function showAchievement(message) {
  if (!achievements.includes(message)) {
    achievements.push(message);
    const achievementDiv = document.getElementById('achievements');
    achievementDiv.textContent = `💧 Achievement: ${message}!`;
    achievementDiv.style.display = 'block';
    setTimeout(() => {
      achievementDiv.style.display = 'none';
    }, 3000);
  }
}

function checkAchievements(progress) {
  if (progress >= 100 && level < 5) {
    level = 5;
    showAchievement(LEVELS[5].name);
  } else if (progress >= 75 && level < 4) {
    level = 4;
    showAchievement(LEVELS[4].name);
  } else if (progress >= 50 && level < 3) {
    level = 3;
    showAchievement(LEVELS[3].name);
  } else if (progress >= 25 && level < 2) {
    level = 2;
    showAchievement(LEVELS[2].name);
  }

  document.getElementById('level').textContent = level;

  document.querySelectorAll('.milestone').forEach((milestone, index) => {
    if (progress >= (index + 1) * 25) {
      milestone.classList.add('achieved');
    }
  });
}

function updateProgress() {
  const progress = (currentCans / GOAL_CANS) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
  document.getElementById('current-cans').textContent = currentCans;
  checkAchievements(progress);

  if (currentCans >= GOAL_CANS) {
    endGame(true);
  }
}

function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

function spawnWaterCan() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => cell.innerHTML = '');

  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  const waterCan = document.createElement('div');
  waterCan.className = 'water-can';
  waterCan.onclick = () => {
    if (gameActive) {
      currentCans++;
      updateProgress();
      waterCan.remove();
    }
  };
  randomCell.appendChild(waterCan);
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  currentCans = 0;
  timeLeft = 30;
  level = 1;
  achievements = [];
  updateProgress();
  createGrid();

  const startButton = document.getElementById('start-game');
  startButton.disabled = true;
  startButton.textContent = 'Quest in Progress...';

  gameTimer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);

  spawnTimer = setInterval(spawnWaterCan, 1000);
}

function endGame(won) {
  gameActive = false;
  clearInterval(gameTimer);
  clearInterval(spawnTimer);
  const startButton = document.getElementById('start-game');
  startButton.disabled = false;
  startButton.textContent = 'Start Quest';

  if (won) {
    showAchievement("Game Complete!");
    confetti();
  }
}

function confetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -5px;
      width: 10px;
      height: 10px;
      background: ${['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)]};
      border-radius: 50%;
      pointer-events: none;
    `;
    document.body.appendChild(confetti);

    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(100vh) rotate(${360 * Math.random()}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 3000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    animation.onfinish = () => confetti.remove();
  }
}

// Event Listener for Start Button
document.getElementById('start-game').addEventListener('click', startGame);
