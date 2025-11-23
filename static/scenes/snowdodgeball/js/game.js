
import { Elf } from './elf.js';
import { Snowball } from './snowball.js';
import { Teams } from './constants.js';

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
    this.startButtonBounds = null; // Will store {x, y, width, height}
    this.restartButtonBounds = null;
    this.homeButtonBounds = null;
    this.elves = [];
    this.snowballs = [];
    this.selectedElf = null;
    this.playerHealth = 100;
    this.opponentHealth = 100;
    this.friendlyFire = false;

    // Arena dimensions (fixed size, centered on screen)
    this.arenaWidth = 1200;
    this.arenaHeight = 900;
    this.arenaX = 0;
    this.arenaY = 0;

    // Spawn point management - tracks timers for each spawn location
    this.spawnPoints = []; // Array of {x, y, timer, active}
    this.spawnRespawnDelay = 4; // seconds

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
    // Don't toggle pause on start screen
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
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw title box
    const boxWidth = 500;
    const boxHeight = 350;
    const boxX = (this.width - boxWidth) / 2;
    const boxY = (this.height - boxHeight) / 2;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Title
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('SNOWDODGEBALL', this.width / 2, boxY + 50);

    // Instructions
    this.ctx.fillStyle = '#555';
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

    this.ctx.fillStyle = '#27ae60';
    this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    this.ctx.strokeStyle = '#1e8449';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('START', this.width / 2, btnY + btnHeight / 2);
  }

  initLevel() {
    this.elves = [];
    this.snowballs = [];
    // Use arena center, not screen center
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
    const snowballCount = 5;
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
    // Don't pause if on start screen
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

    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

    // Draw border
    this.ctx.strokeStyle = '#922b21';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    // Draw "PAUSED" text
    this.ctx.fillStyle = '#ffffff';
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
    this.ctx.fillStyle = this.playerWon ? '#27ae60' : '#c0392b';
    this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

    // Draw border
    this.ctx.strokeStyle = this.playerWon ? '#1e8449' : '#922b21';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    // Draw title text
    this.ctx.fillStyle = '#ffffff';
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

    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(restartX, btnY, btnWidth, btnHeight);
    this.ctx.strokeStyle = '#2980b9';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(restartX, btnY, btnWidth, btnHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('RESTART', restartX + btnWidth / 2, btnY + btnHeight / 2);

    // Home button
    const homeX = this.width / 2 + btnSpacing / 2;
    this.homeButtonBounds = { x: homeX, y: btnY, width: btnWidth, height: btnHeight };

    this.ctx.fillStyle = '#7f8c8d';
    this.ctx.fillRect(homeX, btnY, btnWidth, btnHeight);
    this.ctx.strokeStyle = '#636e72';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(homeX, btnY, btnWidth, btnHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('HOME', homeX + btnWidth / 2, btnY + btnHeight / 2);
  }

  resume() {
    // Don't resume if on start screen
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
    // If on start screen, just re-render it
    if (this.showingStartScreen) {
      this.renderStartScreen();
      return;
    }
    this.playerHealth = 100;
    this.opponentHealth = 100;
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
    this.playerHealth = 100;
    this.opponentHealth = 100;
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
    // Update AI for non-player-controlled elves
    const playerElves = this.elves.filter(e => e.team === Teams.PLAYER);
    const opponentElves = this.elves.filter(e => e.team === Teams.OPPONENT);

    // Arena bounds for AI
    const arenaBounds = {
      x: this.arenaX,
      y: this.arenaY,
      width: this.arenaWidth,
      height: this.arenaHeight
    };

    // Player's uncontrolled elves just wander
    playerElves.forEach(elf => {
      if (!elf.selected) {
        elf.updatePlayerAI(dt, arenaBounds);
      }
    });

    // Opponent elves have smarter AI
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
          // Check if it's a valid hit (different team or friendly fire on)
          if (this.friendlyFire || snowball.team !== elf.team) {
            // Apply damage
            if (elf.team === Teams.PLAYER) {
              this.playerHealth = Math.max(0, this.playerHealth - 20);
            } else {
              this.opponentHealth = Math.max(0, this.opponentHealth - 20);
            }

            // Remove the snowball - spawn point timer will handle respawn
            snowball.markedForRemoval = true;
            break; // Stop checking other elves after hit
          }
        }
      }
    });

    // Update spawn point timers and spawn new snowballs when ready
    this.spawnPoints.forEach(sp => {
      // Check if this spawn point currently has a snowball sitting there
      const hasSnowballAtSpawn = this.snowballs.some(s =>
        !s.heldBy && !s.thrown &&
        Math.abs(s.x - sp.x) < 5 && Math.abs(s.y - sp.y) < 5
      );

      if (hasSnowballAtSpawn) {
        // Spawn point is occupied, reset timer
        sp.timer = 0;
        sp.hasSnowball = true;
      } else {
        // Spawn point is empty
        if (sp.hasSnowball) {
          // Just became empty, start timer
          sp.hasSnowball = false;
          sp.timer = this.spawnRespawnDelay;
        } else if (sp.timer > 0) {
          // Timer counting down
          sp.timer -= dt;
          if (sp.timer <= 0) {
            // Timer expired, spawn new snowball
            this.snowballs.push(new Snowball(sp.x, sp.y));
            sp.hasSnowball = true;
            sp.timer = 0;
          }
        }
      }
    });

    // Check for elf-snowball collisions (pickup)
    this.elves.forEach(elf => {
      // Only allow pickup if elf doesn't already have a snowball
      if (elf.heldSnowball) return;

      this.snowballs.forEach(snowball => {
        // Only pick up snowballs that aren't already held or thrown
        if (snowball.heldBy || snowball.thrown) return;

        if (snowball.collidesWithElf(elf)) {
          snowball.heldBy = elf;
          elf.heldSnowball = snowball;
        }
      });
    });

    // Clean up snowballs that leave the arena and those marked for removal
    this.snowballs = this.snowballs.filter(snowball => {
      if (snowball.markedForRemoval) return false;
      if (!snowball.thrown) return true; // Keep non-thrown snowballs
      const margin = 50;
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

  // Check if a spawn point has a snowball sitting there (not held, not thrown)
  isSpawnPointFree(x, y) {
    const tolerance = 5; // pixels
    return !this.snowballs.some(snowball =>
      !snowball.heldBy &&
      !snowball.thrown &&
      Math.abs(snowball.x - x) < tolerance &&
      Math.abs(snowball.y - y) < tolerance
    );
  }

  render() {
    // Fill background outside arena
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw arena background (white)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.arenaX, this.arenaY, this.arenaWidth, this.arenaHeight);

    // Draw arena border
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.arenaX, this.arenaY, this.arenaWidth, this.arenaHeight);

    // Draw center line (within arena)
    const centerY = this.arenaY + this.arenaHeight / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.arenaX, centerY);
    this.ctx.lineTo(this.arenaX + this.arenaWidth, centerY);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw snowballs that are not held (on the ground)
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

    // Draw Health Bars (inside arena)
    this.renderHealthBar(this.arenaX + 10, this.arenaY + 10, this.opponentHealth, '#e74c3c'); // Top (Opponent)
    this.renderHealthBar(this.arenaX + 10, this.arenaY + this.arenaHeight - 30, this.playerHealth, '#3498db'); // Bottom (Player)

    // Draw Game Over screen on top if game is over
    if (this.gameOver) {
      this.renderGameOverScreen();
    }
  }

  renderHealthBar(x, y, health, color) {
    const width = 200;
    const height = 20;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, height);

    // Health
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, (health / 100) * width, height);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
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
      // Check restart button
      if (this.restartButtonBounds) {
        const btn = this.restartButtonBounds;
        if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
          this.restartGame();
          return;
        }
      }
      // Check home button
      if (this.homeButtonBounds) {
        const btn = this.homeButtonBounds;
        if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
          this.goToHome();
          return;
        }
      }
      return; // Don't process other input on game over screen
    }

    // Don't process game input if not playing
    if (!this.isPlaying) return;

    // Arena center line Y position
    const arenaCenterY = this.arenaY + this.arenaHeight / 2;

    // Check if clicked on an elf
    const clickedElf = this.elves.find(elf => elf.contains(x, y));

    if (clickedElf && clickedElf.team === Teams.PLAYER) {
      // Select the elf
      if (this.selectedElf) this.selectedElf.selected = false;
      this.selectedElf = clickedElf;
      clickedElf.selected = true;
    } else if (this.selectedElf) {
      // Check if clicking on opponent's side (top half of arena) while holding a snowball
      if (y < arenaCenterY && this.selectedElf.heldSnowball) {
        // Throw the snowball
        this.selectedElf.heldSnowball.throw(x, y);
      } else if (y > arenaCenterY) {
        // Move selected elf if clicked on valid ground (bottom half of arena)
        // Clamp to arena bounds
        const clampedX = Math.max(this.arenaX, Math.min(this.arenaX + this.arenaWidth, x));
        const clampedY = Math.max(arenaCenterY, Math.min(this.arenaY + this.arenaHeight, y));
        this.selectedElf.targetX = clampedX;
        this.selectedElf.targetY = clampedY;
      }
    }
  }
}
