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

export class ClockSystem {
  constructor() {
    this.clocks = new Map();
    this.active = false;
    this.timeZero = performance.now();
    this.timeSyncDelta = 0;
  }

  teardown(game) {
    this.clocks.clear();
  }

  get time() {
    return performance.now() - this.timeZero + this.timeSyncDelta;
  }

  synchronize(timeZero, time) {
    this.timeZero = timeZero;
    this.timeSyncDelta = time - performance.now();
  }

  startClock(name, handler) {
    if (!this.clocks.has(name)) {
      this.clocks.set(name, []);
    }

    const handlers = this.clocks.get(name);
    handlers.push(handler);

    if (!this.active) {
      this.active = true;
      this.tick();
    }
  }

  tick() {
    self.requestAnimationFrame(() => {
      if (!this.active) {
        return;
      }

      this.clocks.forEach(handlers =>
          handlers.forEach(handler => handler(this.time)));
      this.tick();
    });
  }
}
