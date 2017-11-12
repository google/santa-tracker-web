
export const lod = {
  HIGH: 'high',
  LOW: 'low'
};

export class LodSystem {
  static get lod() {
    return lod;
  }

  constructor(getCollider = object => object.collider) {
    this.getCollider = getCollider;
    this.lodEntities = [];
    this.limit = null;
  }

  addEntity(entity) {
    this.lodEntities.push(entity);
  }

  removeEntity(entity) {
    const entityIndex = this.lodEntities.indexOf(entity);

    if (entityIndex > -1) {
      this.lodEntities.splice(entityIndex, 1);
    }
  }

  update(game) {
    if (this.limit == null) {
      return;
    }

    const { camera } = game;

    this.limit.position.x = camera.position.x;
    this.limit.position.y = camera.position.y * -4/3;

    for (let i = 0; i < this.lodEntities.length; ++i) {
      const entity = this.lodEntities[i];
      const bounds = this.getCollider(entity);

      if (bounds == null || this.limit.contains(bounds)) {
        entity.lod = lod.HIGH;
      } else {
        entity.lod = lod.LOW;
      }
    }
  }
};
