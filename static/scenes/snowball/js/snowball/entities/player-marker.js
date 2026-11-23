/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

export class PlayerMarker extends EntityMesh {
  /**
   * Red so that it stays distinct from the green shield bubble, which is drawn
   * around the same elf. Both users of this class mark where the client player
   * is — `client-system.js` during the descent, `elf.js` once landed — so the
   * colour belongs here rather than at either call site.
   *
   * `chevron` adds a navigation-style arrowhead outside the ring. It is opt-in
   * because it only means anything on the marker that `elf.js` parents to the
   * dolly: that one inherits `face()`, while the descent marker is parented to
   * the player layer at a fixed rotation and has no heading to show.
   */
  constructor(radius = 15.0, thickness = 4.0, color = 0xea4335, chevron = false) {
    const arc = new Shape();
    arc.moveTo(0, 0);
    arc.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const hole = new Path();
    hole.moveTo(0, 0);
    hole.absarc(0, 0, radius - thickness, 0, Math.PI * 2, true);

    arc.holes.push(hole);

    const shapes = [arc];

    if (chevron) {
      shapes.push(buildChevron(radius));
    }

    super(new ShapeBufferGeometry(shapes), new MeshBasicMaterial({
      color,
      // Denser than the 0.5 this used to be: a half-transparent red washes out
      // to pink against the snow, where the old green held its colour.
      opacity: 0.72,
      transparent: true
    }));
  }
};

/**
 * An arrowhead sitting just clear of the ring, pointing the way the elf is
 * heading.
 *
 * It points along **negative** Y in shape space, which is worth explaining
 * because the obvious guess is wrong. The marker is parented to the elf's dolly
 * with `rotation.x = -PI/2`, and the dolly itself carries `rotation.x = PI/2.25`
 * plus the `rotation.y` that `face()` drives. Composing those three (THREE's
 * default 'XYZ' order gives `Rx(80°) · Ry(angle) · Rx(-90°)`) and feeding in the
 * angle `elf.js` actually passes — `atan2(delta.y, delta.x) + PI/2` — lands
 * shape-space `(0, -1)` on the map-space movement direction, and shape-space
 * `(0, 1)` on its reverse.
 *
 * The 80° tilt also squashes the Y component to ~0.98, which is the same
 * foreshortening the rest of the scene gets, so the arrow reads as lying flat on
 * the tile rather than floating.
 *
 * Because the ring is already a child of the dolly, `face()` rotates the chevron
 * for free — there is no per-frame update anywhere for this.
 */
const buildChevron = (radius) => {
  // Clear of the ring's outer edge, so the two shapes read as separate marks.
  const base = radius + 2.5;
  const tip = base + 8.0;
  const halfWidth = 7.0;
  // Pulls the trailing edge's midpoint towards the tip, turning a plain
  // triangle into the notched chevron that reads as "heading" rather than
  // "pointer".
  const notch = 3.0;

  const chevron = new Shape();
  chevron.moveTo(0, -tip);
  chevron.lineTo(-halfWidth, -base);
  chevron.lineTo(0, -(base + notch));
  chevron.lineTo(halfWidth, -base);
  chevron.lineTo(0, -tip);

  return chevron;
};
