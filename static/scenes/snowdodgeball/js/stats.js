
export class Stats {
  constructor() {
    this.reset();
  }

  reset() {
    this.ballsThrown = 0;
    this.ballsHit = 0;
  }

  recordThrow() {
    this.ballsThrown++;
  }

  recordHit() {
    this.ballsHit++;
  }

  getAccuracy() {
    if (this.ballsThrown === 0) return 0;
    return Math.round((this.ballsHit / this.ballsThrown) * 100);
  }

  getStats() {
    return {
      thrown: this.ballsThrown,
      hit: this.ballsHit,
      accuracy: this.getAccuracy()
    };
  }
}
