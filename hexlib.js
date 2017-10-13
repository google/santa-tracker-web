export class Axial {
  get hash() {
    return `${this.q},${this.r}`;
  }

  constructor(q, r) {
    this.q = q;
    this.r = r;
  }

  toCube() {
    return new Cube(this.q, -this.q - this.r, this.r);
  }
}



export class Cube {
  static get neighbors() {
    return cubeNeighbors;
  }

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = z;
    this.y = y;
    this.z = z;
  }

  get radius() {
    return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  clone() {
    return new Cube(this.x, this.y, this.z);
  }

  toAxial() {
    return new Axial(this.x, this.z);
  }
};

const cubeNeighbors = [
  new Cube(1, -1, 0),
  new Cube(1, 0, -1),
  new Cube(0, 1, -1),
  new Cube(-1, 1, 0),
  new Cube(-1, 0, 1),
  new Cube(0, -1, 1)
];
