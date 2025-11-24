
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
  // AI METHODS
  // =========================================================================

  /**
   * Get a random point within this elf's territory (based on team)
   * @param {Object} arena - Arena bounds {x, y, width, height}
   * @returns {Object} - {x, y} coordinates
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

  /**
   * Unified AI update method
   * @param {number} dt - Delta time
   * @param {Object} arena - Arena bounds
   * @param {Array} snowballs - Available snowballs
   * @param {Object} config - AI configuration {seekChance, seekCooldownAfterSeek, seekCooldownRandomExtra, seekCooldownAfterCheck}
   * @param {Array} [targets=null] - If provided, elf will throw at these targets when holding a snowball
   */
  updateAI(dt, arena, snowballs, config, targets = null) {
    this.wanderTimer -= dt;
    this.seekSnowballCooldown -= dt;

    // If holding a snowball and we have targets, try to throw
    if (this.heldSnowball && targets && targets.length > 0) {
      const target = this.findNearestTarget(targets);
      if (target) {
        const offsetX = (Math.random() - 0.5) * this.throwInaccuracy * 2;
        const offsetY = (Math.random() - 0.5) * this.throwInaccuracy * 2;
        this.heldSnowball.throw(target.x + offsetX, target.y + offsetY);
      }
      return;
    }

    // If not holding a snowball, occasionally try to get one
    if (!this.heldSnowball && this.seekSnowballCooldown <= 0) {
      const availableSnowball = this.findNearestSnowball(snowballs);
      if (availableSnowball && Math.random() < config.seekChance) {
        this.targetX = availableSnowball.x;
        this.targetY = availableSnowball.y;
        this.seekSnowballCooldown = config.seekCooldownAfterSeek +
          Math.random() * (config.seekCooldownRandomExtra || 0);
        this.wanderTimer = this.wanderInterval;
        return;
      }
      this.seekSnowballCooldown = config.seekCooldownAfterCheck;
    }

    // Wander in territory
    if (this.wanderTimer <= 0) {
      this.wanderTimer = this.wanderInterval + Math.random();
      const point = this.getRandomPointInTerritory(arena);
      this.targetX = point.x;
      this.targetY = point.y;
    }
  }

  // Convenience methods that use the unified updateAI with preset configs
  updatePlayerAI(dt, arena, snowballs) {
    this.updateAI(dt, arena, snowballs, {
      seekChance: PlayerAI.SEEK_SNOWBALL_CHANCE,
      seekCooldownAfterSeek: PlayerAI.SEEK_COOLDOWN_AFTER_SEEK,
      seekCooldownRandomExtra: PlayerAI.SEEK_COOLDOWN_RANDOM_EXTRA,
      seekCooldownAfterCheck: PlayerAI.SEEK_COOLDOWN_AFTER_CHECK
    });
  }

  updateOpponentAI(dt, arena, snowballs, playerElves) {
    this.updateAI(dt, arena, snowballs, {
      seekChance: OpponentAI.SEEK_SNOWBALL_CHANCE,
      seekCooldownAfterSeek: OpponentAI.SEEK_COOLDOWN_AFTER_SEEK,
      seekCooldownRandomExtra: 0,
      seekCooldownAfterCheck: OpponentAI.SEEK_COOLDOWN_AFTER_CHECK
    }, playerElves);
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
