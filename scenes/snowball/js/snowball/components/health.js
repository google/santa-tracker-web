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

export class Health extends Component {
  constructor() {
    super();
    this.lastAliveTime = -1;
  }

  get alive() {
    return this.lastAliveTime < 0;
  }

  set alive(value) {
    if (value === false) {
      if (this.alive) {
        this.lastAliveTime = performance.now()
      }
    } else {
      this.lastAliveTime = -1;
    }
  }

  get dead() {
    return !this.alive;
  }

  revive() {
    this.lastAliveTime = -1;
  }
};
