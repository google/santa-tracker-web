
import { Snowball as SnowballConfig } from './constants.js';

export class Snowball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.spawnX = x; // Original spawn position
    this.spawnY = y;
    this.radius = SnowballConfig.RADIUS;
    this.heldBy = null; // Reference to the elf holding this snowball
    this.thrown = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = SnowballConfig.SPEED;
    this.team = null; // Team that threw the snowball
  }

  throw(targetX, targetY) {
    // Calculate direction to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize and set velocity
    this.velocityX = (dx / dist) * this.speed;
    this.velocityY = (dy / dist) * this.speed;

    // Release from elf
    if (this.heldBy) {
      this.team = this.heldBy.team; // Track which team threw the snowball
      this.heldBy.heldSnowball = null;
      this.heldBy = null;
    }
    this.thrown = true;
  }

  update(dt) {
    // If held by an elf, follow the elf's position
    if (this.heldBy) {
      this.x = this.heldBy.x;
      this.y = this.heldBy.y;
    } else if (this.thrown) {
      // Move in straight line
      this.x += this.velocityX * dt;
      this.y += this.velocityY * dt;
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = SnowballConfig.FILL_COLOR;
    ctx.fill();
    ctx.lineWidth = SnowballConfig.STROKE_WIDTH;
    ctx.strokeStyle = SnowballConfig.STROKE_COLOR;
    ctx.stroke();
  }

  contains(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  }

  // Check if this snowball collides with an elf
  collidesWithElf(elf) {
    const dx = this.x - elf.x;
    const dy = this.y - elf.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (this.radius + elf.radius);
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.thrown = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.team = null;
  }
}
