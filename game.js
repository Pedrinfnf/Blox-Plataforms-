const player = document.getElementById('player');
const game = document.getElementById('game');
const platforms = document.querySelectorAll('.ground, .platform');

let pos = { x: 100, y: 100 };
let velocity = { x: 0, y: 0 };
let onGround = false;
const gravity = 0.5;
const jumpStrength = -10;
const speed = 3;

const keys = {
  left: false,
  right: false,
  up: false
};

// Controles de teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ' || e.key === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === ' ' || e.key === 'ArrowUp') keys.up = false;
});

function gameLoop() {
  // Movimento horizontal
  if (keys.left) velocity.x = -speed;
  else if (keys.right) velocity.x = speed;
  else velocity.x = 0;

  // Pulo
  if (keys.up && onGround) {
    velocity.y = jumpStrength;
    onGround = false;
  }

  // Gravidade
  velocity.y += gravity;
  pos.x += velocity.x;
  pos.y += velocity.y;

  // Colisão com chão/plataformas
  onGround = false;
  platforms.forEach(platform => {
    const rect = platform.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const platformTop = rect.top - game.getBoundingClientRect().top;

    if (
      playerRect.bottom <= rect.top &&
      playerRect.bottom + velocity.y >= rect.top &&
      playerRect.right > rect.left &&
      playerRect.left < rect.right
    ) {
      velocity.y = 0;
      pos.y = platformTop - player.offsetHeight;
      onGround = true;
    }
  });

  // Reposição do personagem se cair
  if (pos.y > 500) {
    pos.x = 100;
    pos.y = 100;
    velocity.y = 0;
  }

  // Aplicar posição
  player.style.left = pos.x + 'px';
  player.style.top = pos.y + 'px';

  requestAnimationFrame(gameLoop);
}

gameLoop();
