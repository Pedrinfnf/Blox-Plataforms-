(() => {
  // Elementos DOM
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const startScreen = document.getElementById('startScreen');
  const startBtn = document.getElementById('startBtn');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScoreText = document.getElementById('finalScoreText');
  const restartBtn = document.getElementById('restartBtn');

  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const jumpBtn = document.getElementById('jumpBtn');
  const fireBtn = document.getElementById('fireBtn');

  const levelDisplay = document.getElementById('levelDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const livesDisplay = document.getElementById('livesDisplay');
  const powerupDisplay = document.getElementById('powerupDisplay');
  const mechanicsDisplay = document.getElementById('mechanicsDisplay');

  // Configurações básicas
  const GRAVITY_BASE = 0.8;
  const CANVAS_W = canvas.width;
  const CANVAS_H = canvas.height;

  // Input State
  const keys = { left: false, right: false, up: false, fire: false };

  // Player
  class Player {
    constructor() {
      this.width = 38;
      this.height = 58;
      this.x = 50;
      this.y = CANVAS_H - this.height - 60;
      this.dy = 0;
      this.speed = 4;
      this.jumpPower = 15;
      this.lives = 1;
      this.maxLives = 2;
      this.score = 0;
      this.powerUps = { vida: false, fire: false, speed: false, jump: false };
      this.onGround = false;
      this.direction = 1; // 1 = right, -1 = left
      this.fireCooldown = 0;
      this.alive = true;
    }

    resetPos() {
      this.x = 50;
      this.y = CANVAS_H - this.height - 60;
      this.dy = 0;
      this.onGround = false;
      this.alive = true;
    }

    update(gravity, phase) {
      if (!this.alive) return;

      // Pulo
      if ((keys.up || keys.jumpBtn) && this.onGround) {
        this.dy = -this.jumpPower * (this.powerUps.jump ? 1.3 : 1);
        this.onGround = false;
      }

      // Movimento horizontal
      let moveSpeed = this.speed * (this.powerUps.speed ? 1.5 : 1);
      if (keys.left) {
        this.x -= moveSpeed;
        this.direction = -1;
      }
      if (keys.right) {
        this.x += moveSpeed;
        this.direction = 1;
      }

      // Limites do canvas
      this.x = Math.max(0, Math.min(CANVAS_W - this.width, this.x));

      // Gravidade
      this.dy += gravity;
      this.y += this.dy;

      // Colisão com plataformas
      this.onGround = false;
      for (const plat of phase.platforms) {
        if (
          this.x < plat.x + plat.width &&
          this.x + this.width > plat.x &&
          this.y + this.height > plat.y &&
          this.y + this.height < plat.y + plat.height + Math.abs(this.dy)
        ) {
          // Colidiu por cima da plataforma
          if ((gravity > 0 && this.dy >= 0) || (gravity < 0 && this.dy <= 0)) {
            this.y = plat.y - this.height;
            this.dy = 0;
            this.onGround = true;
          }
        }
      }

      // Chão
      if (gravity > 0 && this.y + this.height > CANVAS_H) {
        this.y = CANVAS_H - this.height;
        this.dy = 0;
        this.onGround = true;
      }

      if (gravity < 0 && this.y < 0) {
        this.y = 0;
        this.dy = 0;
        this.onGround = true;
      }
    }

    draw(ctx) {
      ctx.fillStyle = this.powerUps.fire ? 'orange' : 'cyan';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Olhinhos
      ctx.fillStyle = 'black';
      let eyeX = this.direction === 1 ? this.x + this.width - 14 : this.x + 8;
      let eyeY = this.y + 16;
      ctx.fillRect(eyeX, eyeY, 6, 6);
    }
  }

  // Plataforma simples
  class Platform {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
    }

    draw(ctx) {
      ctx.fillStyle = '#55aa55';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  // Inimigo básico
  class Enemy {
    constructor(x, y, w, h, speed = 1) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
      this.speed = speed;
      this.direction = 1;
      this.alive = true;
    }

    update() {
      if (!this.alive) return;

      this.x += this.speed * this.direction;
      if (this.x < 0 || this.x + this.width > CANVAS_W) {
        this.direction *= -1;
      }
    }

    draw(ctx) {
      if (!this.alive) return;
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  // Power-up
  class PowerUp {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.width = 30;
      this.height = 30;
      this.type = type; // 'vida', 'fire', 'speed', 'jump'
      this.collected = false;
    }

    draw(ctx) {
      if (this.collected) return;
      switch (this.type) {
        case 'vida': ctx.fillStyle = 'pink'; break;
        case 'fire': ctx.fillStyle = 'orange'; break;
        case 'speed': ctx.fillStyle = 'yellow'; break;
        case 'jump': ctx.fillStyle = 'purple'; break;
        default: ctx.fillStyle = 'white';
      }
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  // Fase
  class Phase {
    constructor(num, theme, mechanics) {
      this.num = num;
      this.theme = theme; // string (ex: "Cidade Submersa")
      this.mechanics = mechanics; // objeto com dados especiais
      this.platforms = [];
      this.enemies = [];
      this.powerUps = [];
      this.boss = null;
    }

    setup() {
      // Exemplo básico: plataforma chão + 2 pequenas plataformas
      this.platforms = [
        new Platform(0, CANVAS_H - 40, CANVAS_W, 40),
        new Platform(200, CANVAS_H - 140,
