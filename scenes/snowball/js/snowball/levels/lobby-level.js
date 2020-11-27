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

import { Level } from '../../engine/core/level.js';
import { LobbyStatus } from '../ui/lobby-status.js';

export class LobbyLevel extends Level {
  constructor(...args) {
    super(...args);

    this.lobbyStatus = new LobbyStatus();
  }

  setup(game) {
    game.shadowRoot.appendChild(this.lobbyStatus);
  }

  teardown(game) {
    game.shadowRoot.removeChild(this.lobbyStatus);
  }

  update(game) {
    this.lobbyStatus.update(game);
  }
};
