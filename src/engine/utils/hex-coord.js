const { Vector3 } = self.THREE;

export class HexCoord extends Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    super(x, y, z);
  }

  get q() {
    return this.x;
  }

  set q(q) {
    this.x = q;
  }

  get r() {
    return this.y;
  }

  set r(r) {
    this.y = r;
  }

  get s() {
    return this.z;
  }

  set s(s) {
    this.z = s;
  }

  toString() {
    return `${this.x},${this.y},${this.z}`;
  }
};
