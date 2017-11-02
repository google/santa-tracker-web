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

  constructor() {
    super();

    this.hitTarget = new Mesh(
      new PlaneBufferGeometry(100, 100),
      new MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0,
        side: 2,
        transparent: true,
        wireframe: false
      }));

    this.hitTarget.position.y += 40;
    this.hitTarget.position.z -= 500;

    this.collider = Rectangle.allocate(20, 60, this.position.clone());

    this.add(this.hitTarget);
  }

  setup(game) {
    const { inputSystem, playerSystem, collisionSystem } = game;

    collisionSystem.addCollidable(this);

    this.unsubscribe = combine(
        inputSystem.on('pick', event => {
          playerSystem.targetPickEvent = event;
          return false;
        }, this.hitTarget));
  }

  update(game) {
    // TODO(cdata): Need a better way to offset-position colliders.
    this.collider.position.copy(this.position);
    this.collider.position.y += 40;
  }

  teardown(game) {
    const { collisionSystem } = game;

    collisionSystem.removeCollidable(this);
    this.unsubscribe();
  }
};
