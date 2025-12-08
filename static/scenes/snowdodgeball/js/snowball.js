
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
    this.wasDropped = false; // Track if this was dropped after being held
    this.throwCounted = false; // Track if this throw has been counted in stats
  }

  throw(targetX, targetY) {
    // Calculate direction to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize and set velocity
    this.velocityX = (dx / dist) * this.speed;
    this.velocityY = (dy / dist) * this.speed;

    // Release from elf and trigger throw animation
    if (this.heldBy) {
      this.team = this.heldBy.team; // Track which team threw the snowball
      this.heldBy.playThrowAnimation(); // Play throwing animation
      this.heldBy.heldSnowball = null;
      this.heldBy = null;
    }
    this.thrown = true;

    // Play throw sound effect
    window.santaApp.fire('sound-trigger', 'snowball_throw');
  }

  drop() {
    // Drop the snowball without throwing it (just release it)
    if (this.heldBy) {
      this.heldBy.heldSnowball = null;
      this.heldBy = null;
    }
    this.wasDropped = true; // Mark as dropped for easier pickup
    // Snowball stays at current position, not thrown
  }

  update(dt) {
    // If held by an elf, follow the elf's position with offset based on direction
    if (this.heldBy) {
      const elf = this.heldBy;
      const direction = elf.currentDirection;

      // Offset snowball position based on elf's facing direction
      let offsetX = 0;
      let offsetY = 0;

      if (direction === 'front') {
        offsetX = 0;
        offsetY = 10; // In front of elf
      } else if (direction === 'back') {
        offsetX = 0;
        offsetY = -5; // Behind elf (less visible, as expected)
      } else if (direction === 'side') {
        // Check if flipped to determine left/right
        const isFlipped = elf.innerElem.classList.contains('is-flipped');
        offsetX = isFlipped ? -12 : 12; // To the side in hand
        offsetY = 5;
      }

      this.x = elf.x + offsetX;
      this.y = elf.y + offsetY;
    } else if (this.thrown) {
      // Move in straight line
      this.x += this.velocityX * dt;
      this.y += this.velocityY * dt;
    }
  }

  render(ctx) {
    // Make snowball larger when held for better visibility
    const displayRadius = this.heldBy ? this.radius * 1.3 : this.radius;

    // Create radial gradient for 3D snowball effect
    const gradient = ctx.createRadialGradient(
      this.x - displayRadius * 0.3,
      this.y - displayRadius * 0.3,
      displayRadius * 0.1,
      this.x,
      this.y,
      displayRadius
    );
    gradient.addColorStop(0, '#ffffff');    // Bright highlight
    gradient.addColorStop(0.4, '#f0f8ff'); // Light icy blue
    gradient.addColorStop(0.8, '#e6f2ff'); // Slightly darker blue
    gradient.addColorStop(1, '#d0e8ff');    // Edge shadow

    // Draw main snowball
    ctx.beginPath();
    ctx.arc(this.x, this.y, displayRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw outer stroke for visibility
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#5a9fd4'; // Blue outline
    ctx.stroke();

    // Add small shine highlight
    ctx.beginPath();
    ctx.arc(
      this.x - displayRadius * 0.35,
      this.y - displayRadius * 0.35,
      displayRadius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  contains(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  }

  // Check if this snowball collides with an elf (for hits)
  collidesWithElf(elf) {
    const dx = this.x - elf.x;
    const dy = this.y - elf.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (this.radius + elf.radius);
  }

  // Check if elf can pick up this snowball (larger radius for dropped balls and opponents)
  canBePickedUpBy(elf) {
    const dx = this.x - elf.x;
    const dy = this.y - elf.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Dropped snowballs are easier to pick up for everyone
    if (this.wasDropped) {
      return dist < SnowballConfig.DROPPED_PICKUP_RADIUS;
    }

    // Regular pickup radius varies by team
    const pickupRadius = elf.team === 'opponent'
      ? SnowballConfig.OPPONENT_PICKUP_RADIUS
      : SnowballConfig.PICKUP_RADIUS;
    return dist < pickupRadius;
  }

}

