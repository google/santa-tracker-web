const { Vector3 } = self.THREE;

const neighborBasisVectors = [
  new Vector3(1, -1, 0),
  new Vector3(1, 0, -1),
  new Vector3(0, 1, -1),
  new Vector3(-1, 1, 0),
  new Vector3(-1, 0, 1),
  new Vector3(0, -1, 1)
];

const interstitial = new Vector3();

export class HexGrid {
  static get neighborBasisVectors() {
    return neighborBasisVectors;
  }

  static toPixel(position) {
    const q = position.x;
    const r = position.z;

    position.x = q * 0.75;
    position.y = -0.75 * r + (q % 2) * 0.375;
    position.z = 0;
  }

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.elements = [];
  }

  /**
   * @param {THREE.Vector3} position
   * @param {*} value
   */
  set(position, value) {
    const x = position.x;
    const y = position.z;

    this.elements[x * this.width + y] = value;
  }

  /**
   * @param {THREE.Vector3} position
   * @return {*}
   */
  get(position) {
    const x = position.x;
    const y = position.z;

    return this.elements[x * this.width + y];
  }

  /**
   * @param {THREE.Vector3} position
   * @return {Array<*>}
   */
  neighborsOf(position) {
    const neighbors = [];

    interstitial.copy(position);

    for (let i = 0; i < 6; ++i) {
      neighbors.push(this.get(neighborBasisVectors[i]));
    }

    return neighbors;
  }

  /**
   * @param {THREE.Vector3} from
   * @param {THREE.Vector3} to
   * @param {Function} validator
   * @return {Array<{ position: THREE.Vector3, value: * }>}
   */
  path(from, to, validator = value => !!value) {
    // TODO
  }
};
