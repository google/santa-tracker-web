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

import { MainLevel } from './main-level.js';

export class NetworkLevel extends MainLevel {
  setup(game) {
    super.setup(game);

    this.lastErosionTick = this.lastDropTick = game.setupTick;
  }

  update(game) {
    super.update(game);

    const { mapSystem, tick } = game;
    const { map } = mapSystem;

    if (map != null) {
      const erosionTickDelta = tick - this.lastErosionTick;
      const erosions = Math.floor(erosionTickDelta / 32);

      if (erosions > 0) {
        //console.log(`Tick (Delta: ${erosionTickDelta}, #: ${erosions}):`, tick);
        for (let i = 0; i < erosions; ++i) {
          map.erode();
        }

        this.lastErosionTick = tick;
      }
    }
  }
}
