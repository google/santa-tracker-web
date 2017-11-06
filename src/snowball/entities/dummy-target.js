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
    // TODO(cdata): Need a better way to offset-position colliders.
    //this.collider.position.copy(this.position);
    //this.collider.position.y += 0.8 * this.size;
  }

  teardown(game) {
    const { collisionSystem } = game;

    collisionSystem.removeCollidable(this);
    this.unsubscribe();
  }
};
