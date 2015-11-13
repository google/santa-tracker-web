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
'use strict'

goog.provide('app.Level');

goog.require('b2');

/**
 * Level class
 */
class Level {
  /**
   * @constructor
   * @param {!Element} elem An DOM element which wraps the game.
   * @export
   */
  constructor(elem) {
    this.elem = $(elem);
    this.debug = !!location.search.match(/[?&]debug=true/);
    console.log('New LEVEL');
  }

  /**
   * Game loop. Should be called every frame using requestAnimationFrame.
   * @public
   */
  update() {
    // Box2D can draw it's world using canvas.
    // if (this.debug) {
    //   this.boxWorld.DrawDebugData();
    // }
  }
  
  /**
   * Destroy level and all Box2D/DOM resources
   * @public
   */
  destroy() {
    console.log('Destroy LEVEL');
  }
}

app.Level = Level;
