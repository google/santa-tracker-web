
import {
  Teams,
  Elf as ElfConfig,
  ElfColors,
  PlayerAI,
  OpponentAI
} from './constants.js';

export class Elf {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.radius = ElfConfig.RADIUS;
    this.color = team === Teams.OPPONENT ? ElfColors.OPPONENT : ElfColors.PLAYER;
    this.selected = false;
    this.targetX = x;
    this.targetY = y;
    this.speed = ElfConfig.SPEED;
    this.heldSnowball = null;

    // AI properties
    this.wanderTimer = 0;
    this.wanderInterval = ElfConfig.WANDER_INTERVAL;
    this.seekSnowballCooldown = 0;
    this.throwInaccuracy = OpponentAI.THROW_INACCURACY;
  }

  update(dt) {
    // Simple movement logic
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
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = ElfConfig.STROKE_WIDTH;
    ctx.strokeStyle = ElfConfig.STROKE_COLOR;
    ctx.stroke();

    if (this.selected) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + ElfColors.SELECTION_RING_OFFSET, 0, Math.PI * 2);
      ctx.strokeStyle = ElfColors.SELECTION_RING;
      ctx.lineWidth = ElfColors.SELECTION_RING_WIDTH;
      ctx.stroke();
    }
  }

  contains(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  }

  // Get current velocity (for shot leading calculations)
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

  // Simple wandering AI for player's non-controlled elves
  updatePlayerAI(dt, arena, snowballs) {
    this.wanderTimer -= dt;
    this.seekSnowballCooldown -= dt;

    // If not holding a snowball, occasionally try to get one
    if (!this.heldSnowball) {
      if (this.seekSnowballCooldown <= 0) {
        const availableSnowball = this.findNearestSnowball(snowballs);
        if (availableSnowball && Math.random() < PlayerAI.SEEK_SNOWBALL_CHANCE) {
          this.targetX = availableSnowball.x;
          this.targetY = availableSnowball.y;
          this.seekSnowballCooldown = PlayerAI.SEEK_COOLDOWN_AFTER_SEEK + Math.random() * PlayerAI.SEEK_COOLDOWN_RANDOM_EXTRA;
          this.wanderTimer = this.wanderInterval; // Reset wander timer to avoid interrupting snowball seek
          return;
        }
        this.seekSnowballCooldown = PlayerAI.SEEK_COOLDOWN_AFTER_CHECK;
      }
    }

    // Otherwise, wander in bottom half
    if (this.wanderTimer <= 0) {
      this.wanderTimer = this.wanderInterval + Math.random();

      // Pick a random point within bottom half (player territory)
      const margin = ElfConfig.WANDER_MARGIN;
      const centerY = arena.y + arena.height / 2;
      this.targetX = arena.x + margin + Math.random() * (arena.width - margin * 2);
      this.targetY = centerY + margin + Math.random() * (arena.y + arena.height - centerY - margin * 2);
    }
  }

  // Opponent AI - less aggressive, inaccurate throws
  updateOpponentAI(dt, arena, snowballs, playerElves) {
    this.wanderTimer -= dt;
    this.seekSnowballCooldown -= dt;

    // If holding a snowball, look for a target to throw at
    if (this.heldSnowball) {
      const target = this.findBestTarget(playerElves);
      if (target) {
        // Throw at target's current position with random inaccuracy (no lead)
        const offsetX = (Math.random() - 0.5) * this.throwInaccuracy * 2;
        const offsetY = (Math.random() - 0.5) * this.throwInaccuracy * 2;
        this.heldSnowball.throw(target.x + offsetX, target.y + offsetY);
      }
      return;
    }

    // Only seek snowballs occasionally (cooldown prevents rushing)
    if (this.seekSnowballCooldown <= 0) {
      const availableSnowball = this.findNearestSnowball(snowballs);
      if (availableSnowball && Math.random() < OpponentAI.SEEK_SNOWBALL_CHANCE) {
        this.targetX = availableSnowball.x;
        this.targetY = availableSnowball.y;
        this.seekSnowballCooldown = OpponentAI.SEEK_COOLDOWN_AFTER_SEEK;
        return;
      }
      this.seekSnowballCooldown = OpponentAI.SEEK_COOLDOWN_AFTER_CHECK;
    }

    // Otherwise, wander in top half
    if (this.wanderTimer <= 0) {
      this.wanderTimer = this.wanderInterval + Math.random();
      const margin = ElfConfig.WANDER_MARGIN;
      const centerY = arena.y + arena.height / 2;
      this.targetX = arena.x + margin + Math.random() * (arena.width - margin * 2);
      this.targetY = arena.y + margin + Math.random() * (centerY - arena.y - margin * 2);
    }
  }

  // Find nearest available snowball (not held, not thrown)
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

  // Find best target among player elves
  findBestTarget(playerElves) {
    // For now, just pick the nearest player elf
    let nearest = null;
    let nearestDist = Infinity;

    for (const elf of playerElves) {
      const dx = elf.x - this.x;
      const dy = elf.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = elf;
      }
    }
    return nearest;
  }

  // Calculate where to aim to hit a moving target (lead the shot)
  calculateLeadPosition(target, snowballSpeed) {
    const { vx, vy } = target.getVelocity();

    // Distance to target
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Time for snowball to reach target's current position
    const timeToTarget = dist / snowballSpeed;

    // Predict where target will be
    return {
      x: target.x + vx * timeToTarget,
      y: target.y + vy * timeToTarget
    };
  }
}
