import { Iceberg } from '../entities/iceberg.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

export class IcebergSystem {
  constructor() {
    this.freezingEntities = [];
    this.frozenEntities = [];

    this.entityIcebergs = {};
    this.icebergLayer = new Object3D();
  }

  freezeEntity(entity) {
    if (entity.presence == null) {
      return;
    }

    entity.presence.exiting = true;
    this.freezingEntities.push(entity);
  }

  update(game) {
    const { mapSystem } = game;
    const { grid, map } = mapSystem;
    const { cellSize } = grid;

    while (this.freezingEntities.length) {
      const entity = this.freezingEntities.pop();
      const iceberg = Iceberg.allocate();
      const tileIndex = grid.positionToIndex(entity.position);

      console.log('Adding iceberg');
      iceberg.setup(game);

      entity.position.set(0, 0, -16);

      iceberg.add(entity);

      grid.indexToPosition(tileIndex, iceberg.position);
      iceberg.position.y -= 32;
      iceberg.position.z += 32;

      this.entityIcebergs[entity.uuid] = iceberg;
      this.frozenEntities.push(entity);

      this.icebergLayer.add(iceberg);
    }

    if (map == null) {
      return;
    }
    const { tileRings } = map;

    for (let i = 0; i < this.frozenEntities.length; ++i) {
      const entity = this.frozenEntities[i];
      const iceberg = this.entityIcebergs[entity.uuid];
      const islandRadius = (tileRings.length + 2.0) * cellSize;

      iceberg.update(game);

      intermediateVector2.copy(iceberg.position);
      const icebergDistance = intermediateVector2.length();

      intermediateVector2.set(game.width / 2, game.height / 2);
      const screenDistance = intermediateVector2.length() + islandRadius;

      if (icebergDistance > screenDistance) {
        const { presence } = entity;

        console.log('Removing iceberg');

        iceberg.remove(entity);
        this.icebergLayer.remove(iceberg);
        this.entityIcebergs[entity.uuid] = null;
        this.frozenEntities.splice(i--, 1);
        Iceberg.free(iceberg);

        presence.present = presence.exiting = false;
      }
    }
  }
}
