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

  constructor() {
    super();
    const material = new MeshBasicMaterial({
      map: this.map,
      side: 2,
      transparent: true,
    });

    const geometry = new PlaneBufferGeometry(50, 50);
    const mesh = new Mesh(geometry, material);

    this.add(mesh);
    mesh.position.y += 40;
    mesh.position.z += 3;
  }
};
