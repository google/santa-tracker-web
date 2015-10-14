/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('app.shared.SharedGame');

goog.require('app.shared.SharedGameOver');
goog.require('app.shared.Scoreboard');

app.shared.SharedGame = SharedGame;

/**
 * A game in Santa Tracker.
 * @interface
 * @extends {SharedGameOver}
 */
function SharedGame() {
  // TODO(samthor): It's not clear that with the current settings, Closure
  // enforces that these properties exist.
  /** @public {!Scoreboard} */ this.scoreboard;
  /** @public {number} */ this.level;
};

/**
 */
SharedGame.prototype.restart = function() {};

/**
 */
SharedGame.prototype.dispose = function() {};

