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

goog.provide('app.Wave');

goog.require('app.Constants');

/**
 * Constructor for wave group.
 * @constructor
 * @extends {Item}
 * @param {!Game} game The game object.
 */
app.Wave = function(parent) {
  this.game = parent;
  this.wave = parent.add.group();
  for (var i = 0; i < 4; i++) {
    let waveType = Math.ceil(Math.random() * 2);
    let wave = this.wave.create(Math.random() * 3000, Math.random() * 3000, 'sprite-wave' + waveType);
    let anim = wave.animations.add('default');
    wave.scale.setTo(2, 2);
    wave.animations.play('default', 12, false);
    anim.onComplete.add(function() {
      wave.x = Math.floor(Math.random() * 2000 + 500);
      wave.y = Math.floor(Math.random() * 2000 + 500);
      wave.angle += Math.floor(Math.random() * 2) * 180;
      wave.animations.play('default', 10, false);
    });
  }
};

/**
 * Send wave to back
 */
app.Wave.prototype.sendBack = function() {
  this.game.world.sendToBack(this.wave);
};