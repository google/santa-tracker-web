/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Game');

/**
 * @fileoverview This is the entrypoint for Elf Ski. It runs `goog.provide` for the main
 * entrypoint, but the rest of the game is in modern ES6 modules.
 */

import { Character } from './physics.js';

/**
 * @export
 */
app.Game = class Game {
  constructor() {
  }

  /**
   * @export
   * @return {!Character}
   */
  static newCharacter() {
    return new Character();
  }
};
