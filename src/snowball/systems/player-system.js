import { Elf } from '../entities/elf.js';

const { Object3D, Vector2 } = self.THREE;

const intermediateVector2 = new Vector2();

const PI_OVER_TWO = Math.PI / 2.0;

export class PlayerSystem {
  constructor() {
    this.path = null;
    this.playerLayer = new Object3D();
    this.player = new Elf(34);
    this.playerLayer.add(this.player);

    this.targetPosition = null;
    this.targetPickEvent = null;
  }

  assignPath(path) {
    this.path = path;
  }

  setup(game) {
    this.player.setup(game);
  }

  update(game) {
    const { snowballSystem } = game;

    if (this.targetPickEvent != null) {
      const uv = this.targetPickEvent.uv;
      this.targetPosition = this.targetPickEvent.target.parent.position.clone();

      this.targetPickEvent = null;
    }

    if (this.path != null && this.path.length) {
      const nextWaypoint = this.path[0];
      const delta = intermediateVector2;
      delta.subVectors(nextWaypoint, this.player.position);
      const length = delta.length();
      delta.normalize();
      delta.multiplyScalar(2.25);
      const lengthNormalized = delta.length();

      if (length <= lengthNormalized) {
        this.player.position.x = nextWaypoint.x;
        this.player.position.y = nextWaypoint.y;
        this.path.shift();
      } else {
        this.player.position.x += delta.x;
        this.player.position.y += delta.y;
      }

      this.player.face(Math.atan2(delta.y, delta.x) + PI_OVER_TWO);
      this.player.run();
    } else {
      this.player.idle();
    }

    if (this.targetPosition != null) {
      intermediateVector2.copy(this.player.position);
      snowballSystem.throwSnowball(intermediateVector2, this.targetPosition);
      intermediateVector2
          .subVectors(this.targetPosition, this.player.position)
          .normalize();

      this.player.face(Math.atan2(intermediateVector2.y, intermediateVector2.x) +
          PI_OVER_TWO);

      this.targetPosition = null;
    }

    this.player.update(game);
  }

  throwSnowballAt(targetPosition) {
    this.targetPosition = targetPosition;
  }
};
