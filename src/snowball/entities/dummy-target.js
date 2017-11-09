import { Elf } from './elf.js';
import { dummy } from '../textures.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { combine } from '../../engine/utils/function.js';

const {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry
} = self.THREE;

export class DummyTarget extends Elf {
  get map() {
    return dummy;
  }

  constructor(size = 50) {
    super(size);

    this.hitTarget = new Mesh(
      new PlaneBufferGeometry(size * 2, size * 2),
      new MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.5,
        visible: false,
        side: 2,
        transparent: true,
        wireframe: false
      }));

    this.hitTarget.position.z = 12;

    this.collider = Rectangle.allocate(size * 0.4, size * 1.2, this.position);

    this.add(this.hitTarget);

    this.lodNeedsUpdate = false;
  }

  set highLod(value) {
    if (value != this.highLod) {
      this.lodNeedsUpdate = true;
    }

    this.visible = value;
  }

  get highLod() {
    return this.visible;
  }

  initializeModel() {
    if (this.highLod) {
      super.initializeModel();
    }
  }

  setup(game) {
    const { inputSystem, playerSystem, collisionSystem } = game;

    super.setup(game);

    collisionSystem.addCollidable(this);

    this.unsubscribe = combine(
        inputSystem.on('pick', event => {
          playerSystem.targetPickEvent = event;
          return false;
        }, this.hitTarget));
  }

  update(game) {
    if (this.lodNeedsUpdate) {
      if (this.highLod) {
        this.initializeModel();
      };

      this.lodNeedsUpdate = false;
    }

    if (this.model) {
      this.model.play('elf_rig_idle');
    }

    super.update(game);
  }

  teardown(game) {
    const { collisionSystem } = game;

    collisionSystem.removeCollidable(this);

    this.unsubscribe();
  }
};
