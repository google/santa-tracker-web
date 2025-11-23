
export class Snowball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.heldBy = null; // Reference to the elf holding this snowball
  }

  update(dt) {
    // If held by an elf, follow the elf's position
    if (this.heldBy) {
      this.x = this.heldBy.x;
      this.y = this.heldBy.y;
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ccc';
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
}
