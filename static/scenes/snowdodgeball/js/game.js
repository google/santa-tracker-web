
import { Elf } from './elf.js';
import { Snowball } from './snowball.js';
import {
  Teams,
  Arena,
  Gameplay,
  UIColors,
  HealthBar
} from './constants.js';

export class Game {
  constructor(canvas, api) {
    this.canvas = canvas;
    this.api = api;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this.isPlaying = false;
    this.showingStartScreen = true;
    this.gameOver = false;
    this.playerWon = false;
    this.startButtonBounds = null;
    this.restartButtonBounds = null;
    this.homeButtonBounds = null;
    this.elves = [];
    this.snowballs = [];
    this.selectedElf = null;
    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.friendlyFire = Gameplay.FRIENDLY_FIRE;

    // Arena dimensions (fixed size, centered on screen)
    this.arenaWidth = Arena.WIDTH;
    this.arenaHeight = Arena.HEIGHT;
    this.arenaX = 0;
    this.arenaY = 0;

    // Spawn point management
    this.spawnPoints = [];
    this.spawnRespawnDelay = Gameplay.SPAWN_RESPAWN_DELAY;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Input handling
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.togglePause();
    }
  }

  togglePause() {
    if (this.showingStartScreen) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Center the arena
    this.arenaX = (this.width - this.arenaWidth) / 2;
    this.arenaY = (this.height - this.arenaHeight) / 2;
  }

  start() {
    this.showingStartScreen = true;
    this.renderStartScreen();
  }

  startGame() {
    this.showingStartScreen = false;
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.initLevel();
    this.loop();
  }

  renderStartScreen() {
    // Fill background
    this.ctx.fillStyle = UIColors.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw title box
    const boxWidth = 500;
    const boxHeight = 350;
    const boxX = (this.width - boxWidth) / 2;
    const boxY = (this.height - boxHeight) / 2;

    this.ctx.fillStyle = Arena.BACKGROUND_COLOR;
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = Arena.BORDER_COLOR;
    this.ctx.lineWidth = Arena.BORDER_WIDTH;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Title
    this.ctx.fillStyle = UIColors.TITLE_COLOR;
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('SNOWDODGEBALL', this.width / 2, boxY + 50);

    // Instructions
    this.ctx.fillStyle = UIColors.TEXT_COLOR;
    this.ctx.font = '18px Arial';
    const instructions = [
      'Click your elves (blue) to select them',
      'Click in your area to move',
      'Pick up snowballs from the center line',
      'Click enemy side to throw and deal damage!',
      'Reduce enemy health to zero to win'
    ];
    instructions.forEach((text, i) => {
      this.ctx.fillText(text, this.width / 2, boxY + 110 + i * 28);
    });

    // Start button
    const btnWidth = 180;
    const btnHeight = 50;
    const btnX = (this.width - btnWidth) / 2;
    const btnY = boxY + boxHeight - 80;

    this.startButtonBounds = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

    this.ctx.fillStyle = UIColors.START_BUTTON;
    this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    this.ctx.strokeStyle = UIColors.START_BUTTON_BORDER;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

    this.ctx.fillStyle = UIColors.BUTTON_TEXT_COLOR;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('START', this.width / 2, btnY + btnHeight / 2);
  }

  initLevel() {
    this.elves = [];
    this.snowballs = [];
    const centerX = this.arenaX + this.arenaWidth / 2;
    const centerY = this.arenaY + this.arenaHeight / 2;

    // Top team (AI/Opponent)
    this.elves.push(new Elf(centerX - 100, centerY - 100, Teams.OPPONENT));
    this.elves.push(new Elf(centerX, centerY - 150, Teams.OPPONENT));
    this.elves.push(new Elf(centerX + 100, centerY - 100, Teams.OPPONENT));

    // Bottom team (Player)
    this.elves.push(new Elf(centerX - 100, centerY + 100, Teams.PLAYER));
    this.elves.push(new Elf(centerX, centerY + 150, Teams.PLAYER));
    this.elves.push(new Elf(centerX + 100, centerY + 100, Teams.PLAYER));

    // Initialize spawn points along the center divider
    const snowballCount = Gameplay.SNOWBALL_COUNT;
    const spacing = this.arenaWidth / (snowballCount + 1);
    this.spawnPoints = [];
    for (let i = 1; i <= snowballCount; i++) {
      const x = this.arenaX + spacing * i;
      const y = centerY;
      this.spawnPoints.push({ x, y, timer: 0, hasSnowball: true });
      this.snowballs.push(new Snowball(x, y));
    }
  }

  pause() {
    if (this.showingStartScreen) {
      this.renderStartScreen();
      return;
    }
    this.isPlaying = false;
    this.renderPauseScreen();
  }

  renderPauseScreen() {
    // Dim the background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw red modal box
    const modalWidth = 300;
    const modalHeight = 200;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    this.ctx.fillStyle = UIColors.LOSE_BACKGROUND;
    this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

    // Draw border
    this.ctx.strokeStyle = UIColors.LOSE_BORDER;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    // Draw "PAUSED" text
    this.ctx.fillStyle = UIColors.BUTTON_TEXT_COLOR;
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2 - 20);

    // Draw instruction text
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Press ESC to resume', this.width / 2, this.height / 2 + 30);
  }

  renderGameOverScreen() {
    // Dim the background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw modal box
    const modalWidth = 400;
    const modalHeight = 280;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    // Background color based on win/lose
    this.ctx.fillStyle = this.playerWon ? UIColors.WIN_BACKGROUND : UIColors.LOSE_BACKGROUND;
    this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

    // Draw border
    this.ctx.strokeStyle = this.playerWon ? UIColors.WIN_BORDER : UIColors.LOSE_BORDER;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    // Draw title text
    this.ctx.fillStyle = UIColors.BUTTON_TEXT_COLOR;
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.playerWon ? 'YOU WIN!' : 'GAME OVER', this.width / 2, modalY + 60);

    // Draw subtitle
    this.ctx.font = '20px Arial';
    this.ctx.fillText(
      this.playerWon ? 'You defeated the opponents!' : 'The opponents won!',
      this.width / 2, modalY + 110
    );

    // Restart button
    const btnWidth = 150;
    const btnHeight = 45;
    const btnSpacing = 20;
    const restartX = this.width / 2 - btnWidth - btnSpacing / 2;
    const btnY = modalY + modalHeight - 90;

    this.restartButtonBounds = { x: restartX, y: btnY, width: btnWidth, height: btnHeight };

    this.ctx.fillStyle = UIColors.RESTART_BUTTON;
    this.ctx.fillRect(restartX, btnY, btnWidth, btnHeight);
    this.ctx.strokeStyle = UIColors.RESTART_BUTTON_BORDER;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(restartX, btnY, btnWidth, btnHeight);

    this.ctx.fillStyle = UIColors.BUTTON_TEXT_COLOR;
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('RESTART', restartX + btnWidth / 2, btnY + btnHeight / 2);

    // Home button
    const homeX = this.width / 2 + btnSpacing / 2;
    this.homeButtonBounds = { x: homeX, y: btnY, width: btnWidth, height: btnHeight };

    this.ctx.fillStyle = UIColors.HOME_BUTTON;
    this.ctx.fillRect(homeX, btnY, btnWidth, btnHeight);
    this.ctx.strokeStyle = UIColors.HOME_BUTTON_BORDER;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(homeX, btnY, btnWidth, btnHeight);

    this.ctx.fillStyle = UIColors.BUTTON_TEXT_COLOR;
    this.ctx.fillText('HOME', homeX + btnWidth / 2, btnY + btnHeight / 2);
  }

  resume() {
    if (this.showingStartScreen) {
      this.renderStartScreen();
      return;
    }
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restart() {
    if (this.showingStartScreen) {
      this.renderStartScreen();
      return;
    }
    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.initLevel();
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restartGame() {
    this.gameOver = false;
    this.playerWon = false;
    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.selectedElf = null;
    this.initLevel();
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.loop();
  }

  goToHome() {
    this.api.go('');
  }

  loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    const playerElves = this.elves.filter(e => e.team === Teams.PLAYER);
    const opponentElves = this.elves.filter(e => e.team === Teams.OPPONENT);

    const arenaBounds = {
      x: this.arenaX,
      y: this.arenaY,
      width: this.arenaWidth,
      height: this.arenaHeight
    };

    // Player's uncontrolled elves
    playerElves.forEach(elf => {
      if (!elf.selected) {
        elf.updatePlayerAI(dt, arenaBounds, this.snowballs);
      }
    });

    // Opponent elves
    opponentElves.forEach(elf => {
      elf.updateOpponentAI(dt, arenaBounds, this.snowballs, playerElves);
    });

    this.elves.forEach(elf => elf.update(dt));
    this.snowballs.forEach(snowball => snowball.update(dt));

    // Check for snowball hits on elves
    this.snowballs.forEach(snowball => {
      if (!snowball.thrown) return;

      for (const elf of this.elves) {
        if (snowball.collidesWithElf(elf)) {
          if (this.friendlyFire || snowball.team !== elf.team) {
            if (elf.team === Teams.PLAYER) {
              this.playerHealth = Math.max(0, this.playerHealth - Gameplay.DAMAGE_PER_HIT);
            } else {
              this.opponentHealth = Math.max(0, this.opponentHealth - Gameplay.DAMAGE_PER_HIT);
            }
            snowball.markedForRemoval = true;
            break;
          }
        }
      }
    });

    // Update spawn point timers
    this.spawnPoints.forEach(sp => {
      const hasSnowballAtSpawn = this.snowballs.some(s =>
        !s.heldBy && !s.thrown &&
        Math.abs(s.x - sp.x) < Gameplay.SPAWN_POINT_TOLERANCE &&
        Math.abs(s.y - sp.y) < Gameplay.SPAWN_POINT_TOLERANCE
      );

      if (hasSnowballAtSpawn) {
        sp.timer = 0;
        sp.hasSnowball = true;
      } else {
        if (sp.hasSnowball) {
          sp.hasSnowball = false;
          sp.timer = this.spawnRespawnDelay;
        } else if (sp.timer > 0) {
          sp.timer -= dt;
          if (sp.timer <= 0) {
            this.snowballs.push(new Snowball(sp.x, sp.y));
            sp.hasSnowball = true;
            sp.timer = 0;
          }
        }
      }
    });

    // Check for elf-snowball collisions (pickup)
    this.elves.forEach(elf => {
      if (elf.heldSnowball) return;

      this.snowballs.forEach(snowball => {
        if (snowball.heldBy || snowball.thrown) return;

        if (snowball.collidesWithElf(elf)) {
          snowball.heldBy = elf;
          elf.heldSnowball = snowball;
        }
      });
    });

    // Clean up snowballs
    this.snowballs = this.snowballs.filter(snowball => {
      if (snowball.markedForRemoval) return false;
      if (!snowball.thrown) return true;
      const margin = Arena.OUT_OF_BOUNDS_MARGIN;
      const outOfArena = snowball.x < this.arenaX - margin ||
        snowball.x > this.arenaX + this.arenaWidth + margin ||
        snowball.y < this.arenaY - margin ||
        snowball.y > this.arenaY + this.arenaHeight + margin;
      return !outOfArena;
    });

    // Check for game over
    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.playerWon = false;
      this.isPlaying = false;
    } else if (this.opponentHealth <= 0) {
      this.gameOver = true;
      this.playerWon = true;
      this.isPlaying = false;
    }
  }

  render() {
    // Fill background outside arena
    this.ctx.fillStyle = UIColors.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw arena background
    this.ctx.fillStyle = Arena.BACKGROUND_COLOR;
    this.ctx.fillRect(this.arenaX, this.arenaY, this.arenaWidth, this.arenaHeight);

    // Draw arena border
    this.ctx.strokeStyle = Arena.BORDER_COLOR;
    this.ctx.lineWidth = Arena.BORDER_WIDTH;
    this.ctx.strokeRect(this.arenaX, this.arenaY, this.arenaWidth, this.arenaHeight);

    // Draw center line
    const centerY = this.arenaY + this.arenaHeight / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.arenaX, centerY);
    this.ctx.lineTo(this.arenaX + this.arenaWidth, centerY);
    this.ctx.strokeStyle = Arena.CENTER_LINE_COLOR;
    this.ctx.lineWidth = Arena.CENTER_LINE_WIDTH;
    this.ctx.stroke();

    // Draw snowballs that are not held
    this.snowballs.forEach(snowball => {
      if (!snowball.heldBy) {
        snowball.render(this.ctx);
      }
    });

    // Draw elves
    this.elves.forEach(elf => elf.render(this.ctx));

    // Draw held snowballs on top of elves
    this.snowballs.forEach(snowball => {
      if (snowball.heldBy) {
        snowball.render(this.ctx);
      }
    });

    // Draw Health Bars
    this.renderHealthBar(this.arenaX + 10, this.arenaY + 10, this.opponentHealth, HealthBar.OPPONENT_COLOR);
    this.renderHealthBar(this.arenaX + 10, this.arenaY + this.arenaHeight - 30, this.playerHealth, HealthBar.PLAYER_COLOR);

    // Draw Game Over screen on top if game is over
    if (this.gameOver) {
      this.renderGameOverScreen();
    }
  }

  renderHealthBar(x, y, health, color) {
    // Background
    this.ctx.fillStyle = HealthBar.BACKGROUND_COLOR;
    this.ctx.fillRect(x, y, HealthBar.WIDTH, HealthBar.HEIGHT);

    // Health
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, (health / Gameplay.STARTING_HEALTH) * HealthBar.WIDTH, HealthBar.HEIGHT);

    // Border
    this.ctx.strokeStyle = HealthBar.BORDER_COLOR;
    this.ctx.lineWidth = HealthBar.BORDER_WIDTH;
    this.ctx.strokeRect(x, y, HealthBar.WIDTH, HealthBar.HEIGHT);
  }

  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle start screen button click
    if (this.showingStartScreen && this.startButtonBounds) {
      const btn = this.startButtonBounds;
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.startGame();
        return;
      }
    }

    // Handle game over screen buttons
    if (this.gameOver) {
      if (this.restartButtonBounds) {
        const btn = this.restartButtonBounds;
        if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
          this.restartGame();
          return;
        }
      }
      if (this.homeButtonBounds) {
        const btn = this.homeButtonBounds;
        if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
          this.goToHome();
          return;
        }
      }
      return;
    }

    if (!this.isPlaying) return;

    const arenaCenterY = this.arenaY + this.arenaHeight / 2;
    const clickedElf = this.elves.find(elf => elf.contains(x, y));

    if (clickedElf && clickedElf.team === Teams.PLAYER) {
      if (this.selectedElf) this.selectedElf.selected = false;
      this.selectedElf = clickedElf;
      clickedElf.selected = true;
    } else if (this.selectedElf) {
      if (y < arenaCenterY && this.selectedElf.heldSnowball) {
        this.selectedElf.heldSnowball.throw(x, y);
      } else if (y > arenaCenterY) {
        const clampedX = Math.max(this.arenaX, Math.min(this.arenaX + this.arenaWidth, x));
        const clampedY = Math.max(arenaCenterY, Math.min(this.arenaY + this.arenaHeight, y));
        this.selectedElf.targetX = clampedX;
        this.selectedElf.targetY = clampedY;
      }
    }
  }
}
