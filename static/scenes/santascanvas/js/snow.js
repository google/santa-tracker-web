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

goog.provide('app.Snow');
goog.require('app.Constants');
goog.require('app.utils');


/**
 * @constructor
 */
app.Snow = function($elem, canvas, backupCanvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.backup = backupCanvas;
  this.backupContext = backupCanvas.getContext('2d');
  this.playing = false;
  this.cleared = true;
  this.button = $elem.find('[data-tool="snowglobe"]');

  this.flakes = [];
  this.button.on(
      'click.santascanvas touchend.santascanvas', this.toggleSnow.bind(this));
};


app.Snow.prototype.toggleSnow  = function() {
  this.playing = !this.playing;
  this.button.attr('data-snowglobe-snowing', this.playing);
  window.santaApp.fire('sound-trigger', {name: 'cd_toggle_snow', args: [this.playing ? 1 : 0]});
};


app.Snow.prototype.reset  = function() {
  this.playing = false;
  this.flakes = [];
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);
  this.cleared = true;
  this.button.attr('data-snowglobe-snowing', false);
};


app.Snow.prototype.update = function(delta) {
  if (!this.playing && this.cleared) {
    return;
  }

  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);
  this.cleared = true;

  if (this.playing) {
    if (Math.random() > 0.95 &&
        this.flakes.length < app.Constants.SNOW_MAX_PARTICLES) {
      this.addFlake();
    }

    for (var i = 0; i < this.flakes.length; i++) {
      this.drawFlake(this.flakes[i]);
      this.updateFlake(this.flakes[i], delta, i);
    }

    for (var i = this.flakes.length - 1; i >= 0; i--) {
      var flake = this.flakes[i];
      this.drawFlake(flake);
      this.updateFlake(flake, delta);

      if (flake.x > this.backup.width || flake.x < 0 ||
          flake.y > this.backup.height) {
        this.flakes.splice(i, 1);
      }
    }

    this.context.drawImage(this.backup, 0, 0, this.canvas.width,
        this.canvas.height);
    this.cleared = false;
  }
};


app.Snow.prototype.addFlake = function() {
  var distance = app.utils.map(Math.random(), app.Constants.SNOW_MIN_DISTANCE, 1);
  var snowflake = {
    x: Math.random() * this.backup.width,
    y: 0,
    vx: -app.Constants.SNOW_MAX_X / 2 + Math.random() * app.Constants.SNOW_MAX_X,
    vy: distance * app.Constants.SNOW_MAX_Y,
    size: distance * app.Constants.SNOW_MAX_SIZE
  };

  this.flakes.push(snowflake);
};


app.Snow.prototype.updateFlake = function(flake, delta) {
  flake.x += flake.vx * delta;
  flake.y += flake.vy * delta;
};


app.Snow.prototype.drawFlake = function(flake) {
  this.backupContext.fillStyle = 'rgba(255, 255, 255, 0.8)';
  this.backupContext.beginPath();
  this.backupContext.arc(flake.x, flake.y, flake.size, 0, 2 * Math.PI);
  this.backupContext.fill();
};
