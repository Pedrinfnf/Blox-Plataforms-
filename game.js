const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const jumpBtn = document.getElementById('jump');

let keys = { left: false, right: false, up: false };
let player, platforms, gravity, lives, score;

function resetGame() {
  player = { x: 50, y: 400, w: 40, h: 60, dx: 0, dy: 0, onGround: false };
  platforms = [
    { x: 0, y: 500, w: 960, h: 40 },
    { x: 200, y: 420, w: 150, h: 20 },
    { x: 400, y: 350, w: 120, h: 20 }
  ];
  gravity = 0.5;
  lives = 1;
  score = 0;
  updateHUD();
}

function drawPlayer() {
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawPlatforms() {
  ctx.fillStyle = "green";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
}

function updatePlayer() {
  player.dx = keys.left ? -4 : keys.right ? 4 : 0;
  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  player.onGround = false;
  platforms.forEach(p => {
    if (player.x < p.x + p.w &&
        player.x + player.w > p.x &&
        player.y + player.h < p.y + 10 &&
        player.y + player.h > p.y - 10) {
      player.y = p.y - player.h;
      player.dy = 0;
      player.onGround = true;
    }
  });

  if (keys.up && player.onGround) {
    player.dy = -12;
    keys.up = false;
  }

  if (player.y > canvas.height) {
    lives--;
    if (lives <= 0) {
      alert("Game Over!");
      startScreen.style.display = "block";
      return false;
    }
    player.y = 400;
    player.dy = 0;
  }
  return true;
}

function updateHUD() {
  scoreEl.textContent = "Score: " + score;
  livesEl.textContent = "Vidas: " + lives;
}

function loop() {
  if (!updatePlayer()) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawPlatforms();
  updateHUD();
  requestAnimationFrame(loop);
}

startButton.addEventListener('click', () => {
  startScreen.style.display = "none";
  resetGame();
  loop();
});

// Teclado
window.addEventListener('keydown', e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowUp") keys.up = true;
});
window.addEventListener('keyup', e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowUp") keys.up = false;
});

// Mobile
leftBtn.addEventListener('touchstart', () => keys.left = true);
leftBtn.addEventListener('touchend', () => keys.left = false);
rightBtn.addEventListener('touchstart', () => keys.right = true);
rightBtn.addEventListener('touchend', () => keys.right = false);
jumpBtn.addEventListener('touchstart', () => keys.up = true);
jumpBtn.addEventListener('touchend', () => keys.up = false);
