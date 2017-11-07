import { Entity } from '../../engine/core/entity.js';
import { createElf } from '../models.js';

const {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Object3D,
  GLTFLoader
} = self.THREE;


export class Elf extends Entity(Object3D) {
  constructor(size = 50) {
    super();

    this.size = size;

    createElf().then(elf => {
      elf.frustumCulled = false;
      elf.position.z = 19;
      elf.position.y = -10.0;
      elf.rotation.x += Math.PI / 2.25;

      this.graphic = elf;
      this.add(elf);
    });
  }
};
