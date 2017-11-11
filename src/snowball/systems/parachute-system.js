import { Parachute } from '../entities/parachute.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

export class ParachuteSystem {
  constructor(frameCount = 300, dropHeight = 420) {
    this.dropHeight = dropHeight;
    this.frameCount = frameCount;

    this.undroppedEntities = [];
    this.droppingEntities = [];

    this.entityParachutes = new Map();
    this.parachuteLayer = new Object3D();
  }

  dropEntity(entity) {
    if (entity.arrival == null) {
      return;
    }

    this.undroppedEntities.push(entity);
  }

  update(game) {
    const { lodSystem, mapSystem, tick } = game;
    const { grid } = mapSystem;

    while (this.undroppedEntities.length) {
      const entity = this.undroppedEntities.shift();
      const { arrival } = entity;
      const position = grid.indexToPosition(
          arrival.tileIndex, intermediateVector2);
      const parachute = Parachute.allocate();

      parachute.position.x = position.x;
      parachute.position.y = position.y;
      parachute.carry(entity);

      lodSystem.addEntity(parachute);

      this.entityParachutes.set(entity, parachute);
      this.parachuteLayer.add(parachute);

      arrival.droppedAt(tick);

      this.droppingEntities.push(entity);
    }

    for (let i = 0; i < this.droppingEntities.length; ++i) {
      const entity = this.droppingEntities[i];
      const { arrival } = entity;
      const parachute = this.entityParachutes.get(entity);

      const frameDelta = tick - arrival.droppedTick;
      const time = frameDelta / this.frameCount;

      const floor = parachute.size + grid.cellSize / 4.0;
      const position = this.dropHeight - time * this.dropHeight;

      parachute.position.z = position + floor;
      parachute.rotation.y = 0.1 * Math.sin(position / (0.35 * this.dropHeight) * Math.PI);

      if (frameDelta >= this.frameCount) {
        arrival.arrive();

        this.droppingEntities.splice(i--, 1);
        this.entityParachutes.delete(entity);
        this.parachuteLayer.remove(parachute);

        lodSystem.removeEntity(parachute);
        Parachute.free(parachute);
      }
    }
  }
}
