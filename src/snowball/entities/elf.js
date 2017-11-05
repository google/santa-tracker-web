import { Entity } from '../../engine/core/entity.js';
import { elf } from '../textures.js';

const {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Object3D
} = self.THREE;

export class Elf extends Entity(Object3D) {
  get map() {
    return elf;
  }

  constructor(size = 50) {
    super();

    const material = new MeshBasicMaterial({
      map: this.map,
      transparent: true,
    });

    const geometry = new PlaneBufferGeometry(size, size);
    const mesh = new Mesh(geometry, material);

    mesh.position.z += size * 0.5;
    mesh.rotation.x += Math.PI / 6.0

    this.graphic = mesh;
    this.size = size;
    this.add(mesh);
  }
};
