
import { Elf } from './elf.js';
import { Snowball } from './snowball.js';
import { Teams } from './constants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this.isPlaying = false;
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
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.initLevel();
    this.loop();
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

  resume() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restart() {
    this.playerHealth = 100;
    this.opponentHealth = 100;
    this.initLevel();
    if (!this.isPlaying) {
      this.start();
    }
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
