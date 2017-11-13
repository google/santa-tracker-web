// Seeded Math.random implementation, extended from V8. Do not use for secure purposes.

export class SeedRandom {
  constructor(seed = 0x2F6E2B1) {
    this.seed = seed;
  }

  clone() {
    return new SeedRandom(this.seed);
  }

  random() {
    return this.randInt() / 0x10000000;
  }

  randInt() {
    let s = this.seed;
    s = ((s + 0x7ED55D16) + (s << 12))  & 0xFFFFFFFF;
    s = ((s ^ 0xC761C23C) ^ (s >>> 19)) & 0xFFFFFFFF;
    s = ((s + 0x165667B1) + (s << 5))   & 0xFFFFFFFF;
    s = ((s + 0xD3A2646C) ^ (s << 9))   & 0xFFFFFFFF;
    s = ((s + 0xFD7046C5) + (s << 3))   & 0xFFFFFFFF;
    s = ((s ^ 0xB55A4F09) ^ (s >>> 16)) & 0xFFFFFFFF;
    this.seed = s;
    return (s & 0xFFFFFFF)
  }

  randRange(low, high=undefined) {
    if (high === undefined) {
      return this.randRange(0, low);
    }
    return low + ~~((high - low) * this.random());
  }
}
