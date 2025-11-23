
import { Teams } from './constants.js';

export class Elf {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.radius = 20;
    this.color = team === Teams.OPPONENT ? '#e74c3c' : '#3498db'; // Red for top, Blue for bottom
    this.selected = false;
    this.targetX = x;
    this.targetY = y;
    this.speed = 200; // pixels per second
    this.heldSnowball = null; // Reference to snowball being held

    // AI properties
    this.wanderTimer = 0;
    this.wanderInterval = 2; // seconds between picking new wander target
    this.seekSnowballCooldown = 0; // Delay before going for snowballs
    this.throwInaccuracy = 80; // Random spread when throwing (pixels)
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
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    if (this.selected) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#f1c40f'; // Yellow selection ring
      ctx.lineWidth = 3;
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
  updatePlayerAI(dt, arena) {
    this.wanderTimer -= dt;

    if (this.wanderTimer <= 0) {
      this.wanderTimer = this.wanderInterval + Math.random();

      // Pick a random point within bottom half (player territory)
      const margin = this.radius + 10;
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
      if (availableSnowball && Math.random() < 0.3) { // 30% chance to go for it
        this.targetX = availableSnowball.x;
        this.targetY = availableSnowball.y;
        this.seekSnowballCooldown = 2 + Math.random() * 2; // Wait 2-4 seconds before considering again
        return;
      }
      this.seekSnowballCooldown = 1; // Check again in 1 second
    }

    // Otherwise, wander in top half
    if (this.wanderTimer <= 0) {
      this.wanderTimer = this.wanderInterval + Math.random();
      const margin = this.radius + 10;
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
