export class ClockSystem {
  constructor() {
    this.clocks = new Map();
    this.active = false;
  }

  startClock(name, handler) {
    if (!this.clocks.has(name)) {
      this.clocks.set(name, []);
    }

    const handlers = this.clocks.get(name);
    handlers.push(handler);

    if (!this.active) {
      this.active = true;
      this.tick();
    }
  }

  tick() {
    self.requestAnimationFrame(() => {
      if (!this.active) {
        return;
      }

      this.clocks.forEach(handlers => handlers.forEach(handler => handler()));
      this.tick();
    });
  }
}
