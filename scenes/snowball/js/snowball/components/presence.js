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

// NOTE(cdata): This component might have too much overlap with
// Arrival. Consider combining the two.
export class Presence extends Component {
  constructor() {
    super();
    this.present = true;
    this.exiting = false;
  }

  get exiting() {
    return this.exitTime > -1;
  }

  set exiting(value) {
    if (value === true) {
      if (!this.exiting) {
        this.exitTime = performance.now();
      }
    } else {
      this.exitTime = -1;
    }
  }

  get gone() {
    return !this.present && !this.exiting;
  }
};
