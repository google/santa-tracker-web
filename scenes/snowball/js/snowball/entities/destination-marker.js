import { Entity } from '../../engine/core/entity.js';

const {
  Mesh,
  ShapeBufferGeometry,
  Shape,
  Path,
  MeshBasicMaterial
} = self.THREE;

/**
 * @constructor
 * @extends {THREE.Mesh}
 * @implements {EntityInterface}
 */
const EntityMesh = Entity(Mesh);

export class DestinationMarker extends EntityMesh {
  constructor(size = 10.0, color = 0x22cc88) {
    const x = new Shape();

    const armWidth = size / 3.0;
    const halfArmWidth = armWidth / 2.0;
    const armLength = size / 2.0;

    x.moveTo(-halfArmWidth, halfArmWidth);
    x.lineTo(-armLength, halfArmWidth);
    x.lineTo(-armLength, -halfArmWidth);
    x.lineTo(-halfArmWidth, -halfArmWidth);
    x.lineTo(-halfArmWidth, -armLength);
    x.lineTo(halfArmWidth, -armLength);
    x.lineTo(halfArmWidth, -halfArmWidth);
    x.lineTo(armLength, -halfArmWidth);
    x.lineTo(armLength, halfArmWidth);
    x.lineTo(halfArmWidth, halfArmWidth);
    x.lineTo(halfArmWidth, armLength);
    x.lineTo(-halfArmWidth, armLength);
    x.lineTo(-halfArmWidth, halfArmWidth);

    super(new ShapeBufferGeometry(x), new MeshBasicMaterial({
      side: 2,
      color,
      opacity: 0.5,
      transparent: true,
      // NOTE(cdata): This will cause the x to draw on top of other things:
      depthTest: false
    }));
  }

  setup(game) {
    const { mapSystem } = game;
    const { grid } = mapSystem;

    this.rotation.z = Math.PI / 4.0;
    this.position.z = grid.cellSize * 0.5;

    this.visible = false;
  }
}
