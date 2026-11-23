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
  CanvasTexture,
  Sprite,
  SpriteMaterial
} = self.THREE;

/**
 * Width and height of the bubble in world units, at full strength.
 *
 * The elf's collider is 15 wide by 45 deep, so a circle that encloses it needs
 * a radius of about 24; this leaves a little air around that. A tile is 64
 * across, so the bubble stays comfortably inside the elf's own hex and cannot
 * be mistaken for a neighbour's.
 */
const bubbleDiameter = 58.0;

// The bubble swells slightly and fades as the shield lapses, so a player can
// see the protection running out instead of discovering it by dying.
const minimumOpacity = 0.3;
const maximumOpacity = 1.0;
const maximumScale = 1.12;

/**
 * A soft, rim-weighted sphere painted into a canvas.
 *
 * The scene's only light is an `AmbientLight`, so a real `SphereBufferGeometry`
 * would shade completely flat and read as a plain translucent disc no matter
 * which material it used. Painting the falloff instead gives the glassy rim and
 * the highlight that actually make it look spherical, and it costs two
 * triangles rather than a few hundred.
 */
const bubbleTexture = (() => {
  const size = 256;
  const canvas = document.createElement('canvas');

  canvas.width = canvas.height = size;

  const context = canvas.getContext('2d');
  const half = size / 2.0;

  // Nearly clear through the middle so the elf stays readable, thickening
  // towards the edge where a sphere's surface is seen edge-on.
  //
  // Green rather than icy blue, and the rim deepens instead of brightening:
  // the ground is white, so a pale edge simply vanishes into it. Kept thin
  // overall — the rim carries the colour and everything inside it is barely
  // more than a tint, which is what stops the bubble reading as solid paint.
  // The only near-white left is the specular highlight below, which needs the
  // snow to contrast against to read as a highlight at all.
  const body = context.createRadialGradient(half, half, 0, half, half, half);

  body.addColorStop(0.00, 'rgba(255, 255, 255, 0.00)');
  body.addColorStop(0.55, 'rgba(150, 240, 200, 0.05)');
  body.addColorStop(0.86, 'rgba(92, 216, 162, 0.22)');
  body.addColorStop(0.96, 'rgba(52, 190, 132, 0.52)');
  // Back to fully clear just inside the texture's edge, so the silhouette is
  // antialiased by the gradient rather than clipped by the canvas boundary.
  body.addColorStop(1.00, 'rgba(52, 190, 132, 0.00)');

  context.fillStyle = body;
  context.fillRect(0, 0, size, size);

  // A single specular highlight up and to the left. This is what sells the
  // shape as a bubble rather than a ring: it implies a light source and a
  // curved surface catching it.
  const highlightX = size * 0.34;
  const highlightY = size * 0.30;
  const highlightRadius = size * 0.17;
  const highlight = context.createRadialGradient(
      highlightX, highlightY, 0, highlightX, highlightY, highlightRadius);

  highlight.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
  highlight.addColorStop(1.0, 'rgba(255, 255, 255, 0.00)');

  context.fillStyle = highlight;
  context.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
})();

// One texture for every shield. The material is per-instance because each
// bubble fades on its own schedule, so this is only a template to clone.
const materialTemplate = new SpriteMaterial({
  map: bubbleTexture,
  transparent: true,
  opacity: maximumOpacity,
  // A sphere around the elf would show the elf through its near face, which is
  // exactly what drawing unconditionally on top looks like. It also keeps the
  // bubble from being swallowed by the trees and tiles, whose transparent
  // materials cannot be depth-sorted reliably — the same reason the landing
  // shadow and the player marker opt out.
  depthTest: false,
  depthWrite: false
});

/**
 * @constructor
 * @extends {THREE.Sprite}
 * @implements {EntityInterface}
 */
const EntitySprite = Entity(Sprite);

/**
 * A translucent bubble around an elf that is currently immune to snowballs.
 *
 * This is a sprite rather than a sphere on purpose. A sprite always faces the
 * camera, so its silhouette is a perfect circle from any angle — which is all
 * a sphere ever looks like anyway — without having to reason about the two
 * rotations stacked above it. The map is drawn through a gimbal tilted 144
 * degrees and the elf's dolly adds another 80 on top, so a real mesh here would
 * need to undo both to avoid being foreshortened into an ellipse.
 *
 * Added as a child of the elf's dolly rather than its root, because the dolly
 * is already positioned at the elf's body and oriented so that +Y is the
 * direction the elf stands in. The dolly's rotation is irrelevant to a sprite,
 * so `face()` spinning the elf around cannot make the bubble wobble.
 */
export class ShieldBubble extends EntitySprite {
  constructor() {
    super(materialTemplate.clone());

    this.visible = false;
    this.progress = 0.0;
  }

  /**
   * Fraction of the shield's life still to run, 1 at pickup down to 0 as it
   * lapses. The bubble swells and fades as this falls, which reads as the
   * shield dissipating rather than simply switching off.
   *
   * Write-only: nothing needs to read the value back, and the elf already holds
   * the authoritative figure on its `Shield` component.
   */
  set progress(value) {
    const clamped = value < 0.0 ? 0.0 : value > 1.0 ? 1.0 : value;

    const scale = bubbleDiameter * (maximumScale - (maximumScale - 1.0) * clamped);

    // Sprite scale is the sprite's size in world units, so this is the
    // bubble's diameter rather than a multiplier.
    this.scale.set(scale, scale, 1.0);

    this.material.opacity =
        minimumOpacity + (maximumOpacity - minimumOpacity) * clamped;
  }
};
