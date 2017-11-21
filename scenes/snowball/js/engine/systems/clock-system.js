export class ClockSystem {
  constructor() {
    this.clocks = new Map();
    this.active = false;
    this.timeZero = performance.now();
    this.timeSyncDelta = 0;
  }

  get time() {
    return performance.now() - this.timeZero + this.timeSyncDelta;
  }

  synchronize(time) {
    this.timeSyncDelta = time - performance.now();
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

      this.clocks.forEach(handlers =>
          handlers.forEach(handler => handler(this.time)));
      this.tick();
    });
  }
}
