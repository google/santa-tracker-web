
import {
  Teams,
  Elf as ElfConfig,
  ElfColors,
  OpponentAI,
  PlayerAIConfig,
  OpponentAIConfig
} from './constants.js';

export class Elf {
  constructor(x, y, team, index, animations) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.index = index;
    this.animations = animations;
    this.radius = ElfConfig.RADIUS;
    this.color = team === Teams.OPPONENT ? ElfColors.OPPONENT : ElfColors.PLAYER;
    this.targetX = x;
    this.targetY = y;
    this.speed = ElfConfig.SPEED;
    this.heldSnowball = null;

    // AI properties
    this.wanderTimer = 0;
    this.wanderInterval = ElfConfig.WANDER_INTERVAL;
    this.seekSnowballCooldown = 0;
    this.throwInaccuracy = OpponentAI.THROW_INACCURACY;
    this.throwDelayTimer = 0;
    this.dodgeLockTimer = 0;
    this.dodgeCooldown = 0;

    // DOM elements
    const teamClass = team === Teams.OPPONENT ? 'opponent' : 'player';
    this.elem = document.querySelector(`.elf--${teamClass}-${index}`);
    this.innerElem = this.elem.querySelector('.elf__inner');
    this.snowballElem = this.elem.querySelector('.elf__snowball');

    // Animation state
    this.currentDirection = 'front';
    this.currentFrame = 0;
    this.lastAnimationUpdate = 0;

    // Set reset state to make sure wierd lottie overlay doesnt happen
    this.innerElem.classList.remove('direction--back', 'direction--side', 'is-flipped');
    this.innerElem.classList.add('direction--front');

    this.elem.style.transition = 'none';
    this.elem.style.left = `${this.x}px`;
    this.elem.style.top = `${this.y}px`;
    this.elem.offsetHeight;
    this.elem.style.transition = '';
  }

  updateHeldSnowballDisplay() {
    if (this.heldSnowball && this.snowballElem) {
      // Show snowball
      if (!this.snowballElem.hasChildNodes()) {
        const img = document.createElement('img');
        img.src = 'img/snowball.svg';
        img.style.width = '100%';
        img.style.height = '100%';
        this.snowballElem.appendChild(img);
      }
      this.snowballElem.classList.add('is-visible');
    } else if (this.snowballElem) {
      // Hide snowball
      this.snowballElem.classList.remove('is-visible');
    }
  }

  playThrowAnimation() {
    // Add throwing animation class
    this.innerElem.classList.add('is-throwing');

    // Remove it after animation completes
    setTimeout(() => {
      this.innerElem.classList.remove('is-throwing');
    }, 300);
  }

  playHitAnimation() {
    // Add hit animation class
    this.elem.classList.add('is-hit');

    // Drop snowball if holding one
    if (this.heldSnowball) {
      // Offset the snowball position based on direction so it doesn't get picked up immediately
      const offsetDistance = 100;
      if (this.currentDirection === 'front') {
        this.heldSnowball.y += offsetDistance;
      } else if (this.currentDirection === 'back') {
        this.heldSnowball.y -= offsetDistance;
      } else if (this.currentDirection === 'side') {
        const isFlipped = this.innerElem.classList.contains('is-flipped');
        this.heldSnowball.x += isFlipped ? -offsetDistance : offsetDistance;
      }

      this.heldSnowball.drop();
      this.heldSnowball = null;
    }

    // Remove animation class after it completes
    setTimeout(() => {
      this.elem.classList.remove('is-hit');
    }, 400);
  }

  update(dt, arena) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const moveDist = this.speed * dt;
      if (moveDist >= dist) {
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        this.x += (dx / dist) * moveDist;
        this.y += (dy / dist) * moveDist;
      }
    }

    // Enforce territory boundaries - prevent crossing center line
    if (arena) {
      const centerY = arena.y + arena.height / 2;
      if (this.team === Teams.OPPONENT) {
        // Opponent stays in top half with 20px buffer from center. 
        // The oponent elves were getting too much of their torso across the line otherwise.
        const maxY = centerY - 40;
        this.y = Math.min(this.y, maxY);
        this.targetY = Math.min(this.targetY, maxY);
      } else {
        // Player stays in bottom half
        this.y = Math.max(this.y, centerY);
        this.targetY = Math.max(this.targetY, centerY);
      }
    }
  }

  render() {
    // Position the DOM element
    this.elem.style.left = `${this.x}px`;
    this.elem.style.top = `${this.y}px`;

    // Update held snowball display
    this.updateHeldSnowballDisplay();

    // Update animation direction and frame
    this.updateAnimation();
  }

  /**
   * Helper to cycle through animation frames
   */
  cycleAnimationFrames(frameStart, frameEnd, frameSpeed) {
    const now = performance.now();

    if (now - this.lastAnimationUpdate > frameSpeed) {
      if (this.currentFrame < frameStart || this.currentFrame > frameEnd) {
        this.currentFrame = frameStart;
      } else {
        const frameRange = frameEnd - frameStart + 1;
        this.currentFrame = frameStart + ((this.currentFrame - frameStart + 1) % frameRange);
      }
      this.lastAnimationUpdate = now;
    }
    return this.currentFrame;
  }

  updateAnimation() {
    if (!this.animations) return;

    // Determine direction based on movement
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const isMoving = Math.abs(dx) > 1 || Math.abs(dy) > 1;

    // Set direction
    let newDirection = this.currentDirection;
    if (isMoving) {
      if (Math.abs(dy) > Math.abs(dx)) {
        newDirection = dy > 0 ? 'front' : 'back';
      } else {
        newDirection = 'side';
      }
    }

    // Update direction class if changed
    if (newDirection !== this.currentDirection) {
      this.innerElem.classList.remove(`direction--${this.currentDirection}`);
      this.innerElem.classList.add(`direction--${newDirection}`);

      // Reset frame when changing direction to avoid animation glitches
      this.currentFrame = 0;
      this.lastAnimationUpdate = 0;

      this.currentDirection = newDirection;
    }

    // Handle left/right flipping for side view
    if (newDirection === 'side') {
      if (dx < 0) {
        this.innerElem.classList.add('is-flipped');
      } else {
        this.innerElem.classList.remove('is-flipped');
      }
    }

    // Determine frame based on holding and moving state
    const isHolding = !!this.heldSnowball;
    let targetFrame;

    if (isHolding) {
      targetFrame = isMoving
        ? this.cycleAnimationFrames(50, 70, 50)  // Holding + Walking
        : 40;                                     // Holding + Idle
    } else {
      targetFrame = isMoving
        ? this.cycleAnimationFrames(10, 30, 50)  // Walking
        : 0;                                      // Idle
    }

    // Update Lottie animation frame
    if (this.animations[this.currentDirection]) {
      this.animations[this.currentDirection].goToAndStop(targetFrame, true);
    }
  }


  /**
   * Dodge left or right by DODGE_DISTANCE pixels - instant teleport
   * @param {Object} arena - Arena bounds {x, y, width, height}
   */
  dodge(arena) {
    // Check if on cooldown
    if (this.dodgeCooldown > 0) return;

    const dodgeDistance = ElfConfig.DODGE_DISTANCE;
    const margin = ElfConfig.WANDER_MARGIN;
    const leftBound = arena.x + margin;
    const rightBound = arena.x + arena.width - margin;

    // Determine direction: continue in the direction elf is already moving
    let direction;
    const horizontalMovement = this.targetX - this.x;

    if (Math.abs(horizontalMovement) > 5) {
      // Moving horizontally - continue in that direction
      direction = horizontalMovement > 0 ? 1 : -1;
    } else if (this.x - dodgeDistance < leftBound) {
      // Not moving horizontally, but too close to left - go right
      direction = 1;
    } else if (this.x + dodgeDistance > rightBound) {
      // Not moving horizontally, but too close to right - go left
      direction = -1;
    } else {
      // Not moving horizontally, pick random
      direction = Math.random() < 0.5 ? -1 : 1;
    }

    // Instant teleport - directly set position
    const newX = this.x + (direction * dodgeDistance);
    this.x = Math.max(leftBound, Math.min(rightBound, newX));

    // Also update target to match so elf doesn't immediately walk back
    this.targetX = this.x;

    // Enforce territory boundaries - prevent crossing center line
    const centerY = arena.y + arena.height / 2;
    if (this.team === Teams.PLAYER) {
      // Player stays in bottom half
      this.y = Math.max(this.y, centerY);
      this.targetY = Math.max(this.targetY, centerY);
    }

    // Set cooldowns
    this.dodgeCooldown = ElfConfig.DODGE_COOLDOWN;
    this.dodgeLockTimer = ElfConfig.DODGE_LOCK_DURATION;
  }

  getVelocity() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return { vx: 0, vy: 0 };
    return {
      vx: (dx / dist) * this.speed,
      vy: (dy / dist) * this.speed
    };
  }

  // =========================================================================
  // AI HELPERS
  // =========================================================================

  /**
   * Get a random point within this elf's territory (based on team)
   */
  getRandomPointInTerritory(arena) {
    const margin = ElfConfig.WANDER_MARGIN;
    const centerY = arena.y + arena.height / 2;

    const x = arena.x + margin + Math.random() * (arena.width - margin * 2);

    let y;
    if (this.team === Teams.OPPONENT) {
      // Top half
      y = arena.y + margin + Math.random() * (centerY - arena.y - margin * 2);
    } else {
      // Bottom half
      y = centerY + margin + Math.random() * (arena.y + arena.height - centerY - margin * 2);
    }

    return { x, y };
  }

  // =========================================================================
  // AI BEHAVIORS
  // =========================================================================

  /**
   * Unified AI update - runs behaviors in priority order
   */
  updateAI(dt, arena, snowballs, config, targets = null) {
    this.wanderTimer -= dt;
    this.seekSnowballCooldown -= dt;
    this.throwDelayTimer -= dt;
    this.dodgeLockTimer -= dt;
    this.dodgeCooldown -= dt;

    // Don't let AI override movement while dodging
    if (this.dodgeLockTimer > 0) return;

    if (this.tryThrow(targets)) return;
    if (this.trySeek(snowballs, config)) return;
    this.wander(arena);
  }

  /**
   * Behavior: Try to throw snowball at a target
   * @returns {boolean} - True if threw (blocks other actions)
   */
  tryThrow(targets) {
    if (!this.heldSnowball || !targets || targets.length === 0) return false;

    // Wait for throw delay before throwing
    if (this.throwDelayTimer <= 0) {
      const target = this.findNearestTarget(targets);
      if (target) {
        const offsetX = (Math.random() - 0.5) * this.throwInaccuracy * 2;
        const offsetY = (Math.random() - 0.5) * this.throwInaccuracy * 2;
        this.heldSnowball.throw(target.x + offsetX, target.y + offsetY);
      }
      return true;
    }

    // Still waiting - allow wandering while holding snowball
    return false;
  }

  /**
   * Behavior: Try to seek a snowball
   * @returns {boolean} - True if seeking
   */
  trySeek(snowballs, config) {
    // If holding a snowball, we don't need to seek
    if (this.heldSnowball) return false;

    // Check cooldown
    if (this.seekSnowballCooldown > 0) return false;

    const availableSnowball = this.findNearestSnowball(snowballs);
    if (availableSnowball && Math.random() < config.seekChance) {
      this.targetX = availableSnowball.x;
      this.targetY = availableSnowball.y;
      this.seekSnowballCooldown = config.seekCooldownAfterSeek +
        Math.random() * (config.seekCooldownRandomExtra || 0);
      this.wanderTimer = this.wanderInterval; // Reset wander timer
      return true; // Action taken (seeking)
    }

    // Failed check, reset cooldown
    this.seekSnowballCooldown = config.seekCooldownAfterCheck;
    return false;
  }

  /**
   * Behavior: Wander around territory
   */
  wander(arena) {
    // If holding a snowball, ensure we wander back to our territory
    if (this.heldSnowball) {
      const centerY = arena.y + arena.height / 2;
      const targetInOurTerritory = this.team === Teams.OPPONENT
        ? this.targetY < centerY
        : this.targetY > centerY;

      if (!targetInOurTerritory) {
        this.wanderTimer = 0; // Force immediate wander
      }
    }

    // Check if we've reached our destination
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const atDestination = (dx * dx + dy * dy) < 25; // Within 5 pixels

    // Pick new wander point if timer expired OR we've arrived
    if (this.wanderTimer <= 0 || atDestination) {
      this.wanderTimer = this.wanderInterval + Math.random();
      const point = this.getRandomPointInTerritory(arena);
      this.targetX = point.x;
      this.targetY = point.y;
    }
  }

  // Convenience methods using preset configs from constants.js
  updatePlayerAI(dt, arena, snowballs) {
    this.updateAI(dt, arena, snowballs, PlayerAIConfig);
  }

  updateOpponentAI(dt, arena, snowballs, playerElves, configOverride = null) {
    const config = configOverride || OpponentAIConfig;
    this.updateAI(dt, arena, snowballs, config, playerElves);
  }

  // =========================================================================
  // TARGETING HELPERS
  // =========================================================================

  findNearestSnowball(snowballs) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const snowball of snowballs) {
      if (snowball.heldBy || snowball.thrown) continue;

      const dx = snowball.x - this.x;
      const dy = snowball.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = snowball;
      }
    }
    return nearest;
  }

  findNearestTarget(targets) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const target of targets) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = target;
      }
    }
    return nearest;
  }

  // Helper to make opponents better, unused for now.
  calculateLeadPosition(target, snowballSpeed) {
    const { vx, vy } = target.getVelocity();

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const timeToTarget = dist / snowballSpeed;

    return {
      x: target.x + vx * timeToTarget,
      y: target.y + vy * timeToTarget
    };
  }
}
