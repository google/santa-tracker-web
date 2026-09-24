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
  CircleBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

// Sized and coloured after the grey ellipse painted under the trees in
// tiles.png, but lighter. That shadow belongs to scenery which is already
// there; this one is a hint about something that has not landed yet, and
// should not compete with the trees for attention.
const shadowRadius = 13.0;
const shadowColor = 0x9aa0a6;

// The shadow grows and darkens as the elf descends, so that how close a rival
// is to landing can be read at a glance. The maxima are what the shadow looks
// like at the moment of touchdown.
const minimumScale = 0.4;
const maximumScale = 1.0;
const minimumOpacity = 0.06;
const maximumOpacity = 0.2;

// The disc is the same shape for every elf, so a single geometry serves them
// all. The material cannot be shared in the same way, because each shadow
// fades at its own rate, so this one is only a template to clone from.
const geometry = new CircleBufferGeometry(shadowRadius, 24);
const materialTemplate = new MeshBasicMaterial({
  color: shadowColor,
  opacity: maximumOpacity,
  transparent: true,
  // Depth testing is off for the same reason it is off on the client player's
  // arrival marker: the map is drawn with transparent materials whose depth
  // writes cannot be relied on. The cost is that a shadow can draw over a tree
  // that should occlude it, which is less distracting than one that flickers.
  depthTest: false
});

/**
 * @constructor
 * @extends {THREE.Mesh}
 * @implements {EntityInterface}
 */
const EntityMesh = Entity(Mesh);

/**
 * A faint disc marking the tile a parachuting elf is about to land on.
 *
 * It lies flat in the map's XY plane, so the camera tilt squashes it into an
 * ellipse exactly as it does the shadows under the trees — no pre-flattening
 * of the geometry is needed.
 */
export class LandingShadow extends EntityMesh {
  constructor() {
    super(geometry, materialTemplate.clone());

    this.progress = 0.0;
  }

  /**
   * How far through its descent the elf is: 0 when the parachute opens, 1 as it
   * touches down. Drives both the size and the weight of the shadow, since a
   * shadow that grew without darkening would read as a shrinking distance but
   * not as an approaching one.
   *
   * Write-only: `ParachuteSystem` recomputes the fraction from the tick count
   * every frame, so nothing ever needs to read it back.
   */
  set progress(value) {
    const clamped = value < 0.0 ? 0.0 : value > 1.0 ? 1.0 : value;

    const scale = minimumScale + (maximumScale - minimumScale) * clamped;

    // Z is left alone: the disc is flat, and scaling a zero-depth mesh along
    // its normal does nothing useful.
    this.scale.set(scale, scale, 1.0);

    this.material.opacity =
        minimumOpacity + (maximumOpacity - minimumOpacity) * clamped;
  }

  /**
   * Releases the cloned material. The geometry is shared between every shadow,
   * so it deliberately survives.
   */
  dispose() {
    this.material.dispose();
  }
};
