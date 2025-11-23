
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

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Input handling
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // Re-position elves if needed, or just let them be
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
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Top team (AI/Opponent)
    this.elves.push(new Elf(centerX - 100, centerY - 150, Teams.OPPONENT));
    this.elves.push(new Elf(centerX, centerY - 200, Teams.OPPONENT));
    this.elves.push(new Elf(centerX + 100, centerY - 150, Teams.OPPONENT));

    // Bottom team (Player)
    this.elves.push(new Elf(centerX - 100, centerY + 150, Teams.PLAYER));
    this.elves.push(new Elf(centerX, centerY + 200, Teams.PLAYER));
    this.elves.push(new Elf(centerX + 100, centerY + 150, Teams.PLAYER));

    // Spawn snowballs along the center divider
    const snowballCount = 5;
    const spacing = this.width / (snowballCount + 1);
    for (let i = 1; i <= snowballCount; i++) {
      this.snowballs.push(new Snowball(spacing * i, centerY));
    }
  }

  pause() {
    this.isPlaying = false;
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

            // Only respawn if spawn point is not occupied
            if (this.isSpawnPointFree(snowball.spawnX, snowball.spawnY)) {
              snowball.respawn();
            } else {
              snowball.markedForRemoval = true;
            }
            break; // Stop checking other elves after hit
          }
        }
      }
    });

    // Spawn new snowballs for any that need replacement (only if spawn point is free)
    this.snowballs.forEach(snowball => {
      if (snowball.needsReplacement) {
        snowball.needsReplacement = false;
        if (this.isSpawnPointFree(snowball.spawnX, snowball.spawnY)) {
          this.snowballs.push(new Snowball(snowball.spawnX, snowball.spawnY));
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
          snowball.respawnTimer = snowball.respawnDelay; // Start respawn timer
        }
      });
    });

    // Clean up off-screen snowballs and those marked for removal
    this.snowballs = this.snowballs.filter(snowball => {
      if (snowball.markedForRemoval) return false;
      if (!snowball.thrown) return true; // Keep non-thrown snowballs
      const margin = 50;
      const offScreen = snowball.x < -margin || snowball.x > this.width + margin ||
                        snowball.y < -margin || snowball.y > this.height + margin;
      return !offScreen;
    });
  }

  // Check if a spawn point has a snowball sitting there (not held, not thrown)
  isSpawnPointFree(x, y) {
    return !this.snowballs.some(snowball =>
      !snowball.heldBy &&
      !snowball.thrown &&
      snowball.x === x &&
      snowball.y === y
    );
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw center line
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height / 2);
    this.ctx.lineTo(this.width, this.height / 2);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 4;
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

    // Draw Health Bars
    this.renderHealthBar(10, 10, this.opponentHealth, '#e74c3c'); // Top (Opponent)
    this.renderHealthBar(10, this.height - 30, this.playerHealth, '#3498db'); // Bottom (Player)
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

    // Check if clicked on an elf
    const clickedElf = this.elves.find(elf => elf.contains(x, y));

    if (clickedElf && clickedElf.team === Teams.PLAYER) {
      // Select the elf
      if (this.selectedElf) this.selectedElf.selected = false;
      this.selectedElf = clickedElf;
      clickedElf.selected = true;
    } else if (this.selectedElf) {
      // Check if clicking on opponent's side (top half) while holding a snowball
      if (y < this.height / 2 && this.selectedElf.heldSnowball) {
        // Throw the snowball
        this.selectedElf.heldSnowball.throw(x, y);
      } else if (y > this.height / 2) {
        // Move selected elf if clicked on valid ground (bottom half)
        this.selectedElf.targetX = x;
        this.selectedElf.targetY = y;
      }
    }
  }
}
