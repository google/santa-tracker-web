
export class Stats {
  constructor() {
    this.reset();
  }

  reset() {
    this.ballsThrown = 0;
    this.ballsHit = 0;
    this.damageTaken = 0;
  }

  recordThrow() {
    this.ballsThrown++;
  }

  recordHit() {
    this.ballsHit++;
  }

  recordDamage(amount) {
    this.damageTaken += amount;
  }

  getAccuracy() {
    if (this.ballsThrown === 0) return 0;
    return Math.round((this.ballsHit / this.ballsThrown) * 100);
  }

  getStats() {
    return {
      thrown: this.ballsThrown,
      hit: this.ballsHit,
      damageTaken: this.damageTaken,
      accuracy: this.getAccuracy()
    };
  }
}
