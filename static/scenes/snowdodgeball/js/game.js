
import { Elf } from './elf.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this.isPlaying = false;
    this.elves = [];
    this.selectedElf = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Input handling
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    // Re-position elves if needed, or just let them be
  }

  start() {
    this.isPlaying = true;
    this.lastTime = performance.now();
    this.initLevel();
    this.loop();
  }

  initLevel() {
    this.elves = [];
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Top team (AI/Opponent)
    this.elves.push(new Elf(centerX - 100, centerY - 150, 'top'));
    this.elves.push(new Elf(centerX, centerY - 200, 'top'));
    this.elves.push(new Elf(centerX + 100, centerY - 150, 'top'));

    // Bottom team (Player)
    this.elves.push(new Elf(centerX - 100, centerY + 150, 'bottom'));
    this.elves.push(new Elf(centerX, centerY + 200, 'bottom'));
    this.elves.push(new Elf(centerX + 100, centerY + 150, 'bottom'));
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restart() {
    this.initLevel();
    if (!this.isPlaying) {
      this.start();
    }
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
    this.elves.forEach(elf => elf.update(dt));
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw center line
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height / 2);
    this.ctx.lineTo(this.width, this.height / 2);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // Draw elves
    this.elves.forEach(elf => elf.render(this.ctx));
  }

  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on an elf
    const clickedElf = this.elves.find(elf => elf.contains(x, y));

    if (clickedElf && clickedElf.team === 'bottom') {
      // Select the elf
      if (this.selectedElf) this.selectedElf.selected = false;
      this.selectedElf = clickedElf;
      clickedElf.selected = true;
    } else if (this.selectedElf) {
      // Move selected elf if clicked on valid ground (bottom half)
      if (y > this.height / 2) {
        this.selectedElf.targetX = x;
        this.selectedElf.targetY = y;
        // Deselect after moving? Or keep selected? Let's keep selected for now.
      }
    }
  }
}
