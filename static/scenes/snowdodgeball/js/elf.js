
export class Elf {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team; // 'top' or 'bottom'
    this.radius = 20;
    this.color = team === 'top' ? '#e74c3c' : '#3498db'; // Red for top, Blue for bottom
    this.selected = false;
    this.targetX = x;
    this.targetY = y;
    this.speed = 200; // pixels per second
    this.heldSnowball = null; // Reference to snowball being held
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
}
