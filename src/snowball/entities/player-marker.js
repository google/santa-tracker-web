import { Entity } from '../../engine/core/entity.js';

const {
  Mesh,
  ShapeBufferGeometry,
  Shape,
  Path,
  MeshBasicMaterial
} = self.THREE;


export class PlayerMarker extends Entity(Mesh) {
  constructor(radius = 15.0, thickness = 4.0, color = 0x22cc88) {
    const arc = new Shape();
    arc.moveTo(0, 0);
    arc.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const hole = new Path();
    hole.moveTo(0, 0);
    hole.absarc(0, 0, radius - thickness, 0, Math.PI * 2, true);

    arc.holes.push(hole);

    super(new ShapeBufferGeometry(arc), new MeshBasicMaterial({
      color,
      opacity: 0.5,
      transparent: true,
      depthTest: false
    }));
  }
};
