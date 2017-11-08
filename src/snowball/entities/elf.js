import { Entity } from '../../engine/core/entity.js';
import { createElf } from '../models.js';

const {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Object3D,
  GLTFLoader,
  AnimationMixer
} = self.THREE;


export class Elf extends Entity(Object3D) {
  constructor(size = 50) {
    super();

    this.size = size;

    createElf().then(model => {
      const elf = model.object;

      elf.scale.multiplyScalar(5.0);
      elf.position.z = 19;
      elf.position.y = -10.0;
      elf.rotation.x += Math.PI / 2.25;

      this.model = model;
      this.graphic = elf;
      this.add(elf);
    });
  }

  idle() {
    if (this.model != null) {
      this.model.play('elf_rig_idle');
    }
  }

  run() {
    if (this.model != null) {
      this.model.play('elf_rig_run');
    }
  }

  update(game) {
    if (this.model != null) {
      this.model.update(game);
    }
  }
};
