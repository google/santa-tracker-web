import { Entity } from '../../engine/core/entity.js';
import { HexGrid } from '../../engine/utils/hex-grid.js';

const {
  Object3D,
  Vector3,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  TextureLoader
} = self.THREE;

const textureLoader = new TextureLoader();
const hexTextureLoads = new Promise((resolve, reject) => {
  textureLoader.load('/subg-terrain/hex_land.png', resolve, null, reject);
});
const hexMaterial = new MeshBasicMaterial({ transparent: true });
const hexGeometry = new PlaneBufferGeometry(30, 30);

class Hex extends Entity(Mesh) {
  static get width() {
    return 30;
  }

  static get height() {
    return 22.5;
  }

  constructor() {
    super(hexGeometry, hexMaterial);

    this.visible = false;

    hexTextureLoads.then(texture => {
      this.visible = true;
      this.material.map = texture;
      this.material.needsUpdate = true;
    });
  }

  moveTo(cell) {
    const wSize = Hex.width / 2;
    const hSize = Hex.height / 2;

    //const xB = [0, 0];
    //const yB = [-1.5, 1];
    //const zB = [-1.5, -1];

    //const x = wSize * yB[0] * cell.y + wSize * zB[0] * cell.z;
    //const y = hSize * yB[1] * cell.y + hSize * zB[1] * cell.z;

    const yOffset = (cell.x % 2) * hSize;
    const x = Hex.width * cell.x * 0.75;
    const y = -Hex.height * cell.z + yOffset;

    this.position.x = x;
    this.position.y = y;
    this.position.z = 1000 + y;
  }
}

export class Map extends Entity(Object3D) {
  constructor(width = 10, height = 10) {
    super();

    this.width = width;
    this.height = height;
    this.position.x -= (width / 2) * 0.75 * Hex.width;
    this.position.y += (height / 2) * 0.5 * Hex.height;
  }

  setup(game) {
    const { inputSystem } = game;
    const cell = new Vector3();
    this.hexGrid = new HexGrid(this.width, this.height);

    for (let x = 0; x < this.width; ++x) {
      for (let z = 0; z < this.height; ++z) {
        const y = -x - z;
        const hex = new Hex();

        cell.set(x, y, z);
        hex.moveTo(cell);

        inputSystem.on('enter', () => {
          console.log('Enter!', x, y, z);
        }, hex);

        this.add(hex);
        this.hexGrid.set(cell, hex);
      }
    }
  }
};
