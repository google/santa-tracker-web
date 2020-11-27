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

// Seeded Math.random implementation, extended from V8. Do not use for secure purposes.

export class SeedRandom {
  constructor(seed = 0x2F6E2B1) {
    this.seed = seed;
  }

  clone() {
    return new SeedRandom(this.seed);
  }

  random() {
    return this.randInt() / 0x10000000;
  }

  randInt() {
    let s = this.seed;
    s = ((s + 0x7ED55D16) + (s << 12))  & 0xFFFFFFFF;
    s = ((s ^ 0xC761C23C) ^ (s >>> 19)) & 0xFFFFFFFF;
    s = ((s + 0x165667B1) + (s << 5))   & 0xFFFFFFFF;
    s = ((s + 0xD3A2646C) ^ (s << 9))   & 0xFFFFFFFF;
    s = ((s + 0xFD7046C5) + (s << 3))   & 0xFFFFFFFF;
    s = ((s ^ 0xB55A4F09) ^ (s >>> 16)) & 0xFFFFFFFF;
    this.seed = s;
    return (s & 0xFFFFFFF)
  }

  randRange(low, high=undefined) {
    if (high === undefined) {
      return this.randRange(0, low);
    }
    return low + ~~((high - low) * this.random());
  }
}
