
import { Elf } from './elf.js';
import { Snowball } from './snowball.js';
import {
  Teams,
  Arena,
  Gameplay,
  OpponentAI
} from './constants.js';
import { LevelManager } from './level-manager.js';
import { Stats } from './stats.js';
import isTouchDevice from '../../snowbox/js/utils/isTouchDevice.js';
import { _msg } from '../../../src/magic.js';

export class Game {
  constructor(canvas, api, prepareAnimation) {
    this.canvas = canvas;
    this.api = api;
    this.prepareAnimation = prepareAnimation;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this.isPlaying = false;
    this.showingStartScreen = true;
    this.gameOver = false;
    this.playerWon = false;
    this.levelManager = new LevelManager();
    // Initialize global Scoreboard (loaded via script tag in index.html)
    this.scoreboard = new app.shared.Scoreboard(this, null, 3); // 3 levels
    this.gameover = new app.shared.Gameover(this);

    // Override announce_ to hide the timer (pass null for time)
    this.scoreboard.announce_ = function () {
      window.clearTimeout(this.announceTimeout_);
      this.announceTimeout_ = window.setTimeout(() => {
        const detail = {
          score: this.score,
          level: this.level + 1,
          maxLevel: this.levels,
          time: null // Hide timer
        };
        window.santaApp.fire('game-score', detail);
      }, 1);
    };
    this.elves = [];
    this.snowballs = [];
    // Note: selectedElf removed - all player elves now AI-controlled
    this.playerElves = [];
    this.opponentElves = [];
    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.friendlyFire = Gameplay.FRIENDLY_FIRE;

    // Stats tracking
    this.stats = new Stats();

    // Arena dimensions (fixed size, centered on screen)
    this.arenaWidth = Arena.WIDTH;
    this.arenaHeight = Arena.HEIGHT;
    this.arenaX = 0;
    this.arenaY = 0;
    this.ratio = Arena.WIDTH / Arena.HEIGHT; // Aspect ratio 1200/900 = 1.33

    // Scaling properties
    this.scale = 1;
    this.paddingTop = Arena.PADDING_TOP;
    this.paddingLeft = Arena.PADDING_LEFT_PERCENTAGE;
    this.isTouchDevice = isTouchDevice();

    // Update padding for touch devices
    if (this.isTouchDevice) {
      this.paddingTop = Arena.PADDING_TOP_MOBILE;
    }

    // Spawn point management
    this.spawnPoints = [];
    this.spawnRespawnDelay = Gameplay.SPAWN_RESPAWN_DELAY;

    // Animation storage
    this.elfAnimations = {
      player: {},
      opponent: {}
    };
    this.animationsLoaded = false;

    // Gift DOM elements
    this.playerGifts = Array.from(document.querySelectorAll('.health-bar--player .gift'));
    this.opponentGifts = Array.from(document.querySelectorAll('.health-bar--opponent .gift'));

    // Get arena DOM element for scaling
    this.arenaElement = document.getElementById('arena');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize animations
    this.initElfAnimations();

    // Input handling - listen on arena instead of canvas to catch elf clicks
    const arena = document.getElementById('arena');
    arena.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    this.initLevel();
  }


  resize() {
    // Calculate available space
    const maxHeight = window.innerHeight - this.paddingTop * 2;
    const maxWidth = window.innerWidth - window.innerWidth * this.paddingLeft / 100;

    // Calculate target dimensions maintaining aspect ratio
    const targetedHeight = Math.min(
      this.arenaHeight * window.innerWidth / this.arenaWidth,
      maxHeight
    );
    const targetedWidth = Math.min(targetedHeight * this.ratio, maxWidth);

    // Calculate scale factor
    this.scale = targetedWidth / this.arenaWidth;

    // Add extra zoom for touch devices
    if (this.isTouchDevice) {
      this.scale += Arena.ZOOM_TOUCH_DEVICE;
    }

    // Apply CSS transform to scale the entire arena
    this.arenaElement.style.position = 'absolute';
    this.arenaElement.style.left = '50%';
    this.arenaElement.style.top = '50%';
    this.arenaElement.style.transformOrigin = '0 0';

    if (!this.isTouchDevice) {
      this.arenaElement.style.transform = `scale(${this.scale.toFixed(3)}) translate(-50%, -50%)`;
    } else {
      this.arenaElement.style.transform = `scale(${this.scale.toFixed(3)}) translate(-50%, -50%) translateY(${this.paddingTop}px)`;
    }

    // Canvas size remains fixed at base dimensions
    this.canvas.width = this.arenaWidth;
    this.canvas.height = this.arenaHeight;
    this.width = this.arenaWidth;
    this.height = this.arenaHeight;
  }

  initElfAnimations() {
    const loadedAnimations = { player: 0, opponent: 0 };
    const totalAnimations = 6; // 3 directions x 2 teams

    const initAnimation = (team, direction, index) => {
      const playerType = team === 'player' ? 'a' : 'b';
      const path = `img/players/${playerType}/${direction}.json`;
      const container = document.querySelector(`.elf--${team}-${index} .elf__inner`);

      this.prepareAnimation(path, {
        container,
        loop: false,
        autoplay: false,
        rendererSettings: {
          className: `animation animation--${direction}`
        }
      }).then((anim) => {
        // Stop at frame 0 immediately to prevent ghost frame rendering
        anim.goToAndStop(0, true);

        if (!this.elfAnimations[team][index]) {
          this.elfAnimations[team][index] = {};
        }
        this.elfAnimations[team][index][direction] = anim;

        loadedAnimations[team]++;
        if (loadedAnimations.player + loadedAnimations.opponent === totalAnimations) {
          this.animationsLoaded = true;
          console.log('All elf animations loaded');
        }
      });
    };

    // Initialize animations for all elves
    for (let i = 0; i < 3; i++) {
      ['front', 'back', 'side'].forEach(direction => {
        initAnimation('player', direction, i);
        initAnimation('opponent', direction, i);
      });
    }
  }

  updateGifts(health, isPlayer) {
    const maxGifts = Gameplay.STARTING_HEALTH / Gameplay.DAMAGE_PER_HIT; // 5 gifts
    const aliveGifts = Math.ceil(health / Gameplay.DAMAGE_PER_HIT);
    const gifts = isPlayer ? this.playerGifts : this.opponentGifts;

    for (let i = 0; i < maxGifts; i++) {
      const gift = gifts[i];
      const shouldBeAlive = i < aliveGifts;
      const isCurrentlyAlive = !gift.classList.contains('is-dead');

      if (shouldBeAlive !== isCurrentlyAlive) {
        if (!shouldBeAlive) {
          // Gift just died - add pop animation
          gift.classList.add('is-dead', 'is-popping');

          // Remove popping class after animation
          setTimeout(() => {
            gift.classList.remove('is-popping');
          }, 200);
        } else {
          // Gift revived (shouldn't happen in normal gameplay)
          gift.classList.remove('is-dead');
        }
      }
    }
  }

  start() {
    this.showingStartScreen = true;
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');

    // Show start screen
    startScreen.classList.remove('hidden');

    // Add click handler to start button
    startButton.addEventListener('click', () => this.startGame());

    // Add next level button handler
    const nextLevelButton = document.getElementById('next-level-button');
    if (nextLevelButton) {
      nextLevelButton.addEventListener('click', () => this.startNextLevel());
    }

    // Add game over screen button handlers
    const restartButton = document.getElementById('restart-button');
    const homeButton = document.getElementById('home-button');
    restartButton.addEventListener('click', () => this.restartGame());
    homeButton.addEventListener('click', () => this.goToHome());
  }

  startGame() {
    this.showingStartScreen = false;

    // Hide start screen
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.add('hidden');

    // Start background music
    window.santaApp.fire('sound-ambient', 'music_start_ingame');

    this.isPlaying = true;
    this.lastTime = performance.now();
    this.levelManager.reset();
    this.initLevel();
    this.scoreboard.restart();
    this.loop();
  }

  startNextLevel() {
    this.showingStartScreen = false;
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteContent = document.getElementById('level-complete-content');

    gameOverScreen.classList.add('hidden');
    levelCompleteContent.classList.add('hidden');

    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.gameOver = false;
    this.playerWon = false;

    this.levelManager.nextLevel();

    this.isPlaying = true;
    this.lastTime = performance.now();
    this.initLevel(); // Initialize the new level (elves, scoreboard, etc.)
    this.scoreboard.restart();
    this.loop();
  }



  initLevel() {
    this.elves = [];
    this.snowballs = [];

    // Update scoreboard level (0-indexed)
    this.scoreboard.setLevel(this.levelManager.currentLevelIndex);

    // Reset game over flag
    this.gameOver = false;

    // Reset stats for new level
    this.stats.reset();

    const centerX = this.arenaWidth / 2;
    const centerY = this.arenaHeight / 2;

    // Top team (AI/Opponent)
    this.elves.push(new Elf(centerX - 100, centerY - 100, Teams.OPPONENT, 0, this.elfAnimations.opponent[0]));
    this.elves.push(new Elf(centerX, centerY - 150, Teams.OPPONENT, 1, this.elfAnimations.opponent[1]));
    this.elves.push(new Elf(centerX + 100, centerY - 100, Teams.OPPONENT, 2, this.elfAnimations.opponent[2]));

    // Bottom team (Player)
    this.elves.push(new Elf(centerX - 100, centerY + 100, Teams.PLAYER, 0, this.elfAnimations.player[0]));
    this.elves.push(new Elf(centerX, centerY + 150, Teams.PLAYER, 1, this.elfAnimations.player[1]));
    this.elves.push(new Elf(centerX + 100, centerY + 100, Teams.PLAYER, 2, this.elfAnimations.player[2]));

    // Initialize spawn points along the center divider
    const snowballCount = Gameplay.SNOWBALL_COUNT;
    const spacing = this.arenaWidth / (snowballCount + 1);
    this.spawnPoints = [];
    for (let i = 1; i <= snowballCount; i++) {
      const x = spacing * i;
      const y = centerY;
      this.spawnPoints.push({ x, y, timer: 0, hasSnowball: true });
      this.snowballs.push(new Snowball(x, y));
    }

    // Initialize gift displays
    this.updateGifts(this.playerHealth, true);
    this.updateGifts(this.opponentHealth, false);
  }

  pause() {
    if (this.showingStartScreen || this.gameOver) return;
    this.isPlaying = false;
  }

  showGameOverScreen() {
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteContent = document.getElementById('level-complete-content');
    const gameEndContent = document.getElementById('game-end-content');
    const gameOverTitle = document.getElementById('game-over-title');

    // If player won the current level
    if (this.playerWon) {
      if (this.levelManager.hasNextLevel()) {
        // Level Complete - Show level complete screen
        // Update stats display
        const stats = this.stats.getStats();
        document.getElementById('stat-thrown').textContent = stats.thrown;
        document.getElementById('stat-damage').textContent = stats.damageTaken;
        document.getElementById('stat-accuracy').textContent = stats.accuracy + '%';

        // Show level complete content, hide game end content
        levelCompleteContent.classList.remove('hidden');
        gameEndContent.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
      } else {
        // Game Complete (Final Win) - Use API Gameover
        this.gameover.show(this.scoreboard.score, this.levelManager.currentLevelIndex + 1);
      }
    } else {
      // Game Over (Loss) - Show game end screen
      gameOverTitle.textContent = _msg('snowdodgeball_match_lost');
      gameOverTitle.className = 'game-over-screen__title lose';

      // Update stats display for game end
      const stats = this.stats.getStats();
      document.getElementById('end-stat-thrown').textContent = stats.thrown;
      document.getElementById('end-stat-damage').textContent = stats.damageTaken;
      document.getElementById('end-stat-accuracy').textContent = stats.accuracy + '%';

      // Show game end content, hide level complete content
      levelCompleteContent.classList.add('hidden');
      gameEndContent.classList.remove('hidden');
      gameOverScreen.classList.remove('hidden');
    }
  }

  resume() {
    if (this.showingStartScreen) return;
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restart() {
    if (this.showingStartScreen) return;
    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.levelManager.reset();
    this.initLevel();
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restartGame() {
    // Hide game over screen and both content sections
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteContent = document.getElementById('level-complete-content');
    const gameEndContent = document.getElementById('game-end-content');

    gameOverScreen.classList.add('hidden');
    levelCompleteContent.classList.add('hidden');
    gameEndContent.classList.add('hidden');

    this.gameOver = false;
    this.playerWon = false;
    this.playerHealth = Gameplay.STARTING_HEALTH;
    this.opponentHealth = Gameplay.STARTING_HEALTH;
    this.levelManager.reset();
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

  // Required by Scoreboard
  gameover() {
    // We don't use the scoreboard timer for game over, but this method is required.
    // If we did, we would call this.showGameOverScreen() here.
  }

  update(dt) {
    const playerElves = this.elves.filter(e => e.team === Teams.PLAYER);
    const opponentElves = this.elves.filter(e => e.team === Teams.OPPONENT);

    const arenaBounds = {
      x: 0,
      y: 0,
      width: this.arenaWidth,
      height: this.arenaHeight
    };

    // All player elves are now AI-controlled
    playerElves.forEach(elf => {
      elf.updatePlayerAI(dt, arenaBounds, this.snowballs);
    });

    // Opponent elves
    const currentLevel = this.levelManager.getCurrentLevel();
    opponentElves.forEach(elf => {
      elf.updateOpponentAI(dt, arenaBounds, this.snowballs, playerElves, currentLevel.opponentAI);
    });

    this.elves.forEach(elf => elf.update(dt, arenaBounds));
    this.snowballs.forEach(snowball => snowball.update(dt));

    // Track player team throws
    this.snowballs.forEach(snowball => {
      if (snowball.thrown && snowball.team === Teams.PLAYER && !snowball.throwCounted) {
        this.stats.recordThrow();
        snowball.throwCounted = true;
      }
    });

    // Check for snowball hits on elves
    this.snowballs.forEach(snowball => {
      if (!snowball.thrown) return;

      for (const elf of this.elves) {
        if (snowball.collidesWithElf(elf)) {
          if (this.friendlyFire || snowball.team !== elf.team) {
            // Track player team hits on opponents
            if (snowball.team === Teams.PLAYER && elf.team === Teams.OPPONENT) {
              this.stats.recordHit();
            }

            if (elf.team === Teams.PLAYER) {
              this.playerHealth = Math.max(0, this.playerHealth - Gameplay.DAMAGE_PER_HIT);
              this.stats.recordDamage(1); // Track damage taken. For now, just hits and not Gameplay.DAMAGE_PER_HIT
              this.updateGifts(this.playerHealth, true);
            } else {
              this.opponentHealth = Math.max(0, this.opponentHealth - Gameplay.DAMAGE_PER_HIT);
              this.updateGifts(this.opponentHealth, false);
            }

            // Play hit animation and drop snowball
            elf.playHitAnimation();

            // Play hit sound effect
            window.santaApp.fire('sound-trigger', 'snowball_hit');

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

        if (snowball.canBePickedUpBy(elf)) {
          snowball.heldBy = elf;
          elf.heldSnowball = snowball;
          elf.throwDelayTimer = OpponentAI.THROW_DELAY; // Start throw delay countdown
        }
      });
    });

    // Clean up snowballs
    this.snowballs = this.snowballs.filter(snowball => {
      if (snowball.markedForRemoval) return false;
      if (!snowball.thrown) return true;
      const margin = Arena.OUT_OF_BOUNDS_MARGIN;
      const outOfArena = snowball.x < -margin ||
        snowball.x > this.arenaWidth + margin ||
        snowball.y < -margin ||
        snowball.y > this.arenaHeight + margin;
      return !outOfArena;
    });

    // Check for game over
    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.playerWon = false;
      this.isPlaying = false;
      this.showGameOverScreen();
    } else if (this.opponentHealth <= 0) {
      this.gameOver = true;
      this.playerWon = true;
      this.isPlaying = false;
      this.showGameOverScreen();
    }
  }

  render() {
    // Draw arena background
    this.ctx.fillStyle = Arena.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);

    // Draw arena border
    this.ctx.strokeStyle = Arena.BORDER_COLOR;
    this.ctx.lineWidth = Arena.BORDER_WIDTH;
    this.ctx.strokeRect(0, 0, this.arenaWidth, this.arenaHeight);

    // Draw center line
    const centerY = this.arenaHeight / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(this.arenaWidth, centerY);
    this.ctx.strokeStyle = Arena.CENTER_LINE_COLOR;
    this.ctx.lineWidth = Arena.CENTER_LINE_WIDTH;
    this.ctx.stroke();

    // Draw snowballs (only those not held - held ones are rendered as DOM elements)
    this.snowballs.forEach(snowball => {
      if (!snowball.heldBy) {
        snowball.render(this.ctx);
      }
    });

    // Update elf DOM positions and animations
    this.elves.forEach(elf => elf.render(this.ctx));
  }

  onPointerDown(e) {
    if (!this.isPlaying || this.gameOver) return;

    const arena = document.getElementById('arena');
    const rect = arena.getBoundingClientRect();
    // Adjust click coordinates for difference screen sizes.
    const x = (e.clientX - rect.left) / this.scale;
    const y = (e.clientY - rect.top) / this.scale;

    const arenaCenterY = this.arenaHeight / 2;
    const arenaBounds = { x: 0, y: 0, width: this.arenaWidth, height: this.arenaHeight };

    // Check if we clicked on an elf DOM element
    let clickedElf = null;
    const target = e.target;

    // Check if the click was on an elf or its child elements
    if (target.classList.contains('elf') || target.closest('.elf')) {
      const elfElem = target.classList.contains('elf') ? target : target.closest('.elf');
      // Find the elf object that matches this DOM element
      clickedElf = this.elves.find(elf => elf.elem === elfElem);
    }

    if (clickedElf && clickedElf.team === Teams.PLAYER) {
      // Clicked on a player elf -> make it dodge
      clickedElf.dodge(arenaBounds);
    } else if (y < arenaCenterY) {
      // Clicked in enemy territory -> random elf with snowball throws
      const playerElves = this.elves.filter(e => e.team === Teams.PLAYER);
      const elvesWithSnowballs = playerElves.filter(elf => elf.heldSnowball);

      if (elvesWithSnowballs.length > 0) {
        // Pick a random elf to throw
        const randomElf = elvesWithSnowballs[Math.floor(Math.random() * elvesWithSnowballs.length)];
        randomElf.heldSnowball.throw(x, y);
      }
    }
    // Clicking in your territory (not on an elf) does nothing
  }
}
