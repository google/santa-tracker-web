export class Health {
  constructor() {
    this.lastAliveTime = -1;
  }

  get alive() {
    return this.lastAliveTime < 0;
  }

  set alive(value) {
    if (value === false) {
      if (this.alive) {
        this.lastAliveTime = performance.now()
      }
    } else {
      this.lastAliveTime = -1;
    }
  }

  get dead() {
    return !this.alive;
  }
};
