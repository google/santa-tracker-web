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

export const powerupType = {
  NOTHING: 0,
  BIG_SNOWBALL: 1
};

export class Powerups extends Component {
  constructor() {
    super();
    this.primary = null;
    this.secondary = null;
    this.swapped = false;
  }

  swap() {
    this.swapped = !this.swapped;
  }

  get active() {
    return this.swapped
        ? this.secondary
        : this.primary;
  }

  set active(value) {
    if (this.swapped) {
      this.secondary = value;
    } else {
      this.primary = value;
    }

    if (this.active == null && this.inactive != null) {
      this.swap();
    }
  }

  get inactive() {
    return this.swapped
        ? this.primary
        : this.secondary;
  }

  set inactive(value) {
    if (this.active == null) {
      return;
    }

    if (this.swapped) {
      this.primary = value;
    } else {
      this.secondary = value;
    }
  }

  decrementActiveQuantity() {
    const { active } = this;

    if (active == null) {
      return;
    }

    active.quantity--;

    if (active.quantity <= 0) {
      this.pop();
    }
  }

  pop() {
    this.active = null;
  }

  collect(type) {
    if (this.active == null) {
      this.active = new Powerup(type);
    } else {
      this.inactive = new Powerup(type);
    }
  }

  copyFromJson(json) {
    this.primary = this.secondary = null;

    if (json.primary != null) {
      this.collect(json.primary.type);

      if (json.secondary != null) {
        this.collect(json.secondary.type);
      }
    }

    this.swapped = json.swapped;
  }
};

export class Powerup extends Component {
  constructor(type) {
    super();
    this.type = type;
    this.quantity = 3;
  }
};
