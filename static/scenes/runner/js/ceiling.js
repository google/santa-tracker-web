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

goog.provide('app.Ceiling');

/**
 * A ceiling object that handles ceiling size on portrait desktops.
 * @param {Element} context Dom element wrapping the game.
 * 
 * @constructor
 */
app.Ceiling = function(context) {
  this.ceiling = context.find('.ceiling-on-top');
  this.wall = context.find('.wall');
  this.game = context.find('.game');

  this.resizeHandler_ = this.resizeHandler_.bind(this);

  this.resizeHandler_();

  $(window).on('resize.endlessrunner', this.resizeHandler_);
};

app.Ceiling.prototype.resizeHandler_ = function () {
  var topOffset = 0;
  if ($(window).innerHeight() > this.wall.height() * 1.5) {
    topOffset = ($(window).innerHeight() - this.wall.height()) * 0.35;
  }
  this.ceiling.css('height', topOffset);
  this.game.css('top', topOffset);
};