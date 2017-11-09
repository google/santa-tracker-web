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
    this.modelInitialized = false;

    const dolly = new Object3D();
    dolly.rotation.x += Math.PI / 2.25;
    dolly.position.z = 19;
    dolly.position.y = -10.0;
    this.add(dolly);
    this.dolly = dolly;
  }

  initializeModel() {
    if (!this.modelInitialized) {
      console.count('initialize model');
      createElf().then(model => {
        const elf = model.object.children[0];

        elf.scale.multiplyScalar(5.0);

        this.model = model;
        this.dolly.add(elf);
      });
    }

    this.modelInitialized = true;
  }

  face(angle) {
    this.dolly.rotation.y = angle;
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

  setup(game) {
    //this.initializeModel();
  }

  update(game) {
    this.initializeModel();

    if (this.model != null) {
      this.model.update(game);
    }
  }
};
