
import { Elf } from './elf.js';
import { Snowball } from './snowball.js';
import {
  Teams,
  Arena,
  Gameplay,
  UIColors,
  HealthBar,
  OpponentAI
} from './constants.js';

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

    // Animation storage
    this.elfAnimations = {
      player: {},
      opponent: {}
    };
    this.animationsLoaded = false;

    // Gift images for health display
    this.giftImages = {
      blueTrue: new Image(),
      blueFalse: new Image(),
      greenTrue: new Image(),
      greenFalse: new Image()
    };
    this.loadGiftImages();

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize animations
    this.initElfAnimations();

    // Input handling - listen on arena instead of canvas to catch elf clicks
    const arena = document.getElementById('arena');
    arena.addEventListener('pointerdown', (e) => this.onPointerDown(e));
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
    // Canvas size now matches arena size
    this.canvas.width = this.arenaWidth;
    this.canvas.height = this.arenaHeight;
    this.width = this.arenaWidth;
    this.height = this.arenaHeight;
  }

  initElfAnimations() {
    const loadedAnimations = { player: 0, opponent: 0 };
    const totalAnimations = 6; // 3 directions x 2 teams

    const initAnimation = (team, direction, index) => {
      const path = `../buildandbolt/img/players/a/${direction}.json`;
      const container = document.querySelector(`.elf--${team}-${index} .elf__inner`);

      this.prepareAnimation(path, {
        container,
        loop: false,
        autoplay: false,
        rendererSettings: {
          className: `animation animation--${direction}`
        }
      }).then((anim) => {
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

  loadGiftImages() {
    this.giftImages.blueTrue.src = 'img/gift_blue_true.png';
    this.giftImages.blueFalse.src = 'img/gift_blue_false.png';
    this.giftImages.greenTrue.src = 'img/gift_green_true.png';
    this.giftImages.greenFalse.src = 'img/gift_green_false.png';
  }

  start() {
    this.showingStartScreen = true;
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');

    // Show start screen
    startScreen.classList.remove('hidden');

    // Add click handler to start button
    startButton.addEventListener('click', () => this.startGame());
  }

  startGame() {
    this.showingStartScreen = false;

    // Hide start screen
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.add('hidden');
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.initLevel();
    this.loop();
  }

  initLevel() {
    this.elves = [];
    this.snowballs = [];
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
  }

  pause() {
    if (this.showingStartScreen) return;
    this.isPlaying = false;
    this.renderPauseScreen();
  }

  renderPauseScreen() {
    // Dim the background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);

    // Draw red modal box
    const modalWidth = 300;
    const modalHeight = 200;
    const modalX = (this.arenaWidth - modalWidth) / 2;
    const modalY = (this.arenaHeight - modalHeight) / 2;

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
    this.ctx.fillText('PAUSED', this.arenaWidth / 2, this.arenaHeight / 2 - 20);

    // Draw instruction text
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Press ESC to resume', this.arenaWidth / 2, this.arenaHeight / 2 + 30);
  }

  renderGameOverScreen() {
    // Dim the background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);

    // Draw modal box
    const modalWidth = 400;
    const modalHeight = 280;
    const modalX = (this.arenaWidth - modalWidth) / 2;
    const modalY = (this.arenaHeight - modalHeight) / 2;

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
    this.ctx.fillText(this.playerWon ? 'YOU WIN!' : 'GAME OVER', this.arenaWidth / 2, modalY + 60);

    // Draw subtitle
    this.ctx.font = '20px Arial';
    this.ctx.fillText(
      this.playerWon ? 'You defeated the opponents!' : 'The opponents won!',
      this.arenaWidth / 2, modalY + 110
    );

    // Restart button
    const btnWidth = 150;
    const btnHeight = 45;
    const btnSpacing = 20;
    const restartX = this.arenaWidth / 2 - btnWidth - btnSpacing / 2;
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
    const homeX = this.arenaWidth / 2 + btnSpacing / 2;
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
      x: 0,
      y: 0,
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

    this.elves.forEach(elf => elf.update(dt, arenaBounds));
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

            // Play hit animation and drop snowball
            elf.playHitAnimation();

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
    } else if (this.opponentHealth <= 0) {
      this.gameOver = true;
      this.playerWon = true;
      this.isPlaying = false;
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

    // Draw Health as Gifts
    this.renderGifts(10, 10, this.opponentHealth, 'green'); // Opponent uses green gifts
    this.renderGifts(10, this.arenaHeight - 60, this.playerHealth, 'blue'); // Player uses blue gifts

    // Draw Game Over screen on top if game is over
    if (this.gameOver) {
      this.renderGameOverScreen();
    }
  }

  renderGifts(x, y, health, color) {
    const maxGifts = Gameplay.STARTING_HEALTH / Gameplay.DAMAGE_PER_HIT; // 5 gifts
    const aliveGifts = Math.ceil(health / Gameplay.DAMAGE_PER_HIT); // How many gifts should be "true"
    const giftSize = 40; // Size of each gift
    const giftSpacing = 5; // Space between gifts

    // Select the appropriate gift images based on color
    const trueImg = color === 'blue' ? this.giftImages.blueTrue : this.giftImages.greenTrue;
    const falseImg = color === 'blue' ? this.giftImages.blueFalse : this.giftImages.greenFalse;

    // Draw gifts from left to right
    for (let i = 0; i < maxGifts; i++) {
      const giftX = x + i * (giftSize + giftSpacing);
      const img = i < aliveGifts ? trueImg : falseImg;

      if (img.complete) {
        this.ctx.drawImage(img, giftX, y, giftSize, giftSize);
      }
    }
  }

  onPointerDown(e) {
    const arena = document.getElementById('arena');
    const rect = arena.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    const arenaCenterY = this.arenaHeight / 2;

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
      // Select the clicked elf
      if (this.selectedElf) this.selectedElf.selected = false;
      this.selectedElf = clickedElf;
      clickedElf.selected = true;
    } else if (this.selectedElf) {
      // Handle clicks in top half (enemy territory)
      if (y < arenaCenterY) {
        if (this.selectedElf.heldSnowball) {
          // Throw snowball if holding one
          this.selectedElf.heldSnowball.throw(x, y);
        } else {
          // Move to center line if not holding a snowball
          const clampedX = Math.max(0, Math.min(this.arenaWidth, x));
          this.selectedElf.targetX = clampedX;
          this.selectedElf.targetY = arenaCenterY; // Stop at the line
        }
      } else {
        // Handle clicks in bottom half (your territory) - move normally
        const clampedX = Math.max(0, Math.min(this.arenaWidth, x));
        const clampedY = Math.max(arenaCenterY, Math.min(this.arenaHeight, y));
        this.selectedElf.targetX = clampedX;
        this.selectedElf.targetY = clampedY;
      }
    }
  }
}
