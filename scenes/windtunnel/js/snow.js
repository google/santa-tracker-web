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

goog.provide('app.Snow');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 * Class to control the snow from snowblower.
 *
 * @param {!HTMLCanvasElement} canvas The canvas element for the snow.
 * @param {!app.Snowblower} snowblower The scene's snowblower.
 * @param {!app.FanStateManager} fanState The fan state.
 * @constructor
 */
app.Snow = function(canvas, snowblower, fanState) {
  this.ctx_ = canvas.getContext('2d');

  this.width_ = canvas.width = app.Constants.SNOW_CANVAS_WIDTH;
  this.height_ = canvas.height = app.Constants.SNOW_CANVAS_HEIGHT;

  this.gravity_ = 0.15;

  // Determines x acceleration of snow.
  this.windForceMap_ = {};
  this.windForceMap_[app.Constants.FAN_STATE_LOW] = -0.1;
  this.windForceMap_[app.Constants.FAN_STATE_MED] = -0.15;
  this.windForceMap_[app.Constants.FAN_STATE_HIGH] = -0.2;
  this.fanState_ = fanState;

  // Determines the number of new snowflakes that appear.
  this.snowblowerStrengthMap_ = {};
  this.snowblowerStrengthMap_[app.Constants.SNOWBLOWER_STATE_OFF] = 0;
  this.snowblowerStrengthMap_[app.Constants.SNOWBLOWER_STATE_MED] = 0.3;
  this.snowblowerStrengthMap_[app.Constants.SNOWBLOWER_STATE_HIGH] = 0.9;
  this.snowblower_ = snowblower;

  this.snowInitialVelocityX_ = -1;
  this.snowInitialVelocityY_ = -5;
  this.snowInitialX_ = 580;
  this.snowInitialY_ = 280;
  this.snowFadeAreaSize_ = 100;
  this.snowMaxAge_ = 250;

  this.snowflakes_ = [];

  this.onFrame_ = this.onFrame_.bind(this);
};

/**
 * Initializes the snow engine.
 */
app.Snow.prototype.init = function() {
  this.requestId_ = window.requestAnimationFrame(this.onFrame_);
};

/**
 * Stops the snow.
 */
app.Snow.prototype.destroy = function() {
  window.cancelAnimationFrame(this.requestId_);
};

/**
 * Update and draw the next frame.
 *
 * @private
 */
app.Snow.prototype.onFrame_ = function() {
  this.update_();

  this.requestId_ = window.requestAnimationFrame(this.onFrame_);
};

/**
 * Updates snow for the next frame.
 *
 * @private
 */
app.Snow.prototype.update_ = function() {
  // add snowflakes
  if (Math.random() <
      this.snowblowerStrengthMap_[this.snowblower_.getState()]) {
    this.snowflakes_.push({
      x: this.snowInitialX_,
      y: this.snowInitialY_,
      size: 2 + (Math.random() * 5),
      age: 0,
      velocityX: this.snowInitialVelocityX_ + (Math.random() * 6) - 3,
      velocityY: this.snowInitialVelocityY_ + (Math.random() * 6) - 4
    });
  }

  this.ctx_.clearRect(0, 0, this.width_, this.height_);

  // update/delete snows
  var firstLiveSnowflakeIndex = 0;
  for (var i = this.snowflakes_.length - 1; i >= 0; i--) {
    var snowflake = this.snowflakes_[i];

    if (snowflake.age > this.snowMaxAge_) {
      firstLiveSnowflakeIndex++;
      continue;
    }

    snowflake.age++;

    snowflake.velocityX += this.windForceMap_[this.fanState_.getState()];
    snowflake.velocityY += this.gravity_;

    snowflake.x += snowflake.velocityX;
    snowflake.y += snowflake.velocityY;

    this.drawSnowflake_(snowflake);
  }

  this.snowflakes_ = this.snowflakes_.slice(firstLiveSnowflakeIndex);
};

/**
 * Draws the snowflake to canvas.
 *
 * @param {object} snowflake The snowflake object.
 * @private
 */
app.Snow.prototype.drawSnowflake_ = function(snowflake) {
  var alpha = 1;
  if (snowflake.x < this.snowFadeAreaSize_) {
    alpha = 1 - ((this.snowFadeAreaSize_ - snowflake.x) /
        this.snowFadeAreaSize_);
  }

  if (snowflake.y > this.height_ - this.snowFadeAreaSize_) {
    var alphaY = (this.height_ - snowflake.y) / this.snowFadeAreaSize_;
    alpha = Math.min(alpha, alphaY);
  }

  this.ctx_.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
  this.ctx_.beginPath();
  this.ctx_.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2, true);
  this.ctx_.closePath();
  this.ctx_.fill();
};
