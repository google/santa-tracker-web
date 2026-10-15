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

import { Component } from './component.js';

/**
 * How long a shield lasts once collected, in milliseconds.
 *
 * Long enough to cross open ground or push a contested gift, short enough that
 * it cannot be ridden through a crossfire. Two seconds was the first attempt
 * and played as over almost before it registered.
 */
const shieldDuration = 3000;

/**
 * Temporary immunity to snowballs, granted by a shield gift.
 *
 * Like `Health`, this stores a timestamp rather than a flag, so nothing has to
 * tick it down: whether the shield is up is always derived from the clock. That
 * also means collecting a second shield refreshes the full duration rather than
 * stacking, which is the behaviour a player expects from a pickup.
 */
export class Shield extends Component {
  constructor() {
    super();
    this.expiresAt = -1;
  }

  activate(duration = shieldDuration) {
    this.expiresAt = performance.now() + duration;
  }

  get active() {
    return this.expiresAt >= 0 && performance.now() < this.expiresAt;
  }

  /**
   * Milliseconds left on the shield, or 0 once it has lapsed. Feeds `progress`
   * below, which is what the bubble reads.
   */
  get remaining() {
    if (this.expiresAt < 0) {
      return 0;
    }
    const left = this.expiresAt - performance.now();
    return left > 0 ? left : 0;
  }

  /** Fraction of the shield's life still to run, from 1 down to 0. */
  get progress() {
    return this.remaining / shieldDuration;
  }
};
