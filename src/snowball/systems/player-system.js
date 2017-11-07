import { Elf } from '../entities/elf.js';

const { Object3D, Vector2 } = self.THREE;

const intermediateVector2 = new Vector2();

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
        //this.player.position.z += delta.y;
      }

      this.player.graphic.rotation.y = Math.atan2(delta.y, delta.x) + Math.PI / 2.0;
    }

    if (this.targetPosition != null) {
      intermediateVector2.copy(this.player.position);
      snowballSystem.throwSnowball(intermediateVector2, this.targetPosition);
      this.targetPosition = null;
    }

    this.player.update(game);
  }

  throwSnowballAt(targetPosition) {
    this.targetPosition = targetPosition;
  }
};
