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

/**
 * @fileoverview Where the snowman (the elf while slowed by a snowball) is drawn, and where its stick
 * arms and carried toys go. The art itself is in img/snowman-front-*.svg, img/snowman-side-*.svg and
 * img/snowman-arm.svg.
 */

import { ELVES, ELF_SCALE } from './constants.js';

/** Snowman art box (img/snowman-*.svg viewBox); the base sits on the bottom edge. */
export const SNOWMAN_BOX = { w: 80, h: 100 };

/**
 * Stick arm art (img/snowman-arm.svg) in snowman box units: it points right from the shoulder at (0, 0)
 * to the hand at (len, 0); x, y, w, h is its viewBox.
 */
export const SNOWMAN_ARM_BOX = { len: 20, x: -1.5, y: -1.5, w: 23, h: 10 };

/** Snowman height relative to the elf (the snowman is squatter, so a little taller reads the same size). */
const SNOWMAN_SIZE = 1.08;

/**
 * Height in game px of the snowman for the given elf (about the same overall size as that elf).
 * @param {number} elfIdx
 * @return {number}
 */
export function snowmanHeight(elfIdx) {
  const d = ELVES[elfIdx] || ELVES[0];
  return d.front.h * ELF_SCALE * SNOWMAN_SIZE;
}

/**
 * Stick arms for the snowman, relative to its base point (x to the right, y up is negative).
 * Each arm has a shoulder (sx, sy) and a hand (hx, hy); arms with hold=true hold a toy at the hand.
 * Toys are held out beside or in front of the middle snowball so the face, hat and scarf stay visible.
 * @param {number} h snowman height in game px
 * @param {boolean} side true for the side view (walking or climbing)
 * @param {number} facing -1 for left, 1 for right
 * @param {number} toys how many toys it is carrying (0 to 2)
 * @return {!Array<{sx: number, sy: number, hx: number, hy: number, hold: boolean}>}
 */
export function snowmanArms(h, side, facing, toys) {
  const s = h / SNOWMAN_BOX.h;
  const f = facing < 0 ? -1 : 1;
  const arm = (sx, sy, hx, hy, hold) => ({
    sx: (sx - 40) * s * f, sy: (sy - 100) * s, hx: (hx - 40) * s * f, hy: (hy - 100) * s, hold,
  });
  if (side) {
    // Side view: the arm reaches forward, toward where it is walking; two toys are stacked in front
    if (toys >= 2) return [arm(48, 55, 76, 56, true), arm(46, 66, 72, 82, true)];
    if (toys === 1) return [arm(48, 56, 76, 60, true)];
    return [arm(48, 56, 64, 66, false)];
  }
  // Front view: one toy in the hand on the side it faces, two toys one in each hand
  const near = (hold) => arm(55, 55, 79, 60, hold);
  const far = (hold) => arm(25, 55, hold ? 1 : 9, hold ? 60 : 68, hold);
  if (toys >= 2) return [near(true), far(true)];
  if (toys === 1) return [near(true), far(false)];
  return [arm(55, 55, 71, 68, false), far(false)];
}

/**
 * Where each carried toy sits while the elf is a snowman, relative to its base point.
 * @param {number} h snowman height in game px
 * @param {boolean} side
 * @param {number} facing
 * @param {number} toys
 * @return {!Array<{x: number, y: number}>}
 */
export function snowmanToySpots(h, side, facing, toys) {
  return snowmanArms(h, side, facing, toys).filter(a => a.hold).map(a => ({ x: a.hx, y: a.hy }));
}
