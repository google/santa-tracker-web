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

goog.provide('app.Rotator');
goog.require('app.Constants');


/**
 * @constructor
 */
app.Rotator = function($elem) {
  this.elem = $elem;
  this.subscribers = [];

  this.rotateR = this.elem.find('[data-rotate-right]');
  this.rotateL = this.elem.find('[data-rotate-left]');

  this.rotateR.on('click.santascanvas touchend.santascanvas',
      this.rotate.bind(this, 1));
  this.rotateL.on('click.santascanvas touchend.santascanvas',
      this.rotate.bind(this, -1));
  this.rotateR.on('mouseenter.santascanvas', this.onRotateButtonOver.bind(this));
  this.rotateL.on('mouseenter.santascanvas', this.onRotateButtonOver.bind(this));
};


app.Rotator.prototype.rotate = function(direction) {
  var angle = app.Constants.ROTATE_ANGLE * direction;

  window.santaApp.fire('sound-trigger', {name: 'cd_rotate', args: [direction]});

  this.subscribers.forEach(function(subscriber) {
    subscriber.callback.call(subscriber.context, angle);
  }, this);
};

app.Rotator.prototype.onRotateButtonOver = function(e) {

  window.santaApp.fire('sound-trigger', 'generic_button_over');

};

app.Rotator.prototype.subscribe = function(callback, context) {
  this.subscribers.push({
    callback: callback,
    context: context
  });
};
