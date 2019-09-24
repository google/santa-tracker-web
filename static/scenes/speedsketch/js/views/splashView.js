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
'use strict';

goog.provide('app.view.SplashView');
goog.require('app.EventEmitter');


/**
 * @constructor
 */
app.view.SplashView = function(container) {
  app.EventEmitter.call(this);
  this.elem = container.find('.splashview');
  this.elem.hide();
};


app.view.SplashView.prototype = Object.create(app.EventEmitter.prototype);


app.view.SplashView.prototype.enableButtons = function() {
  this.elem.find('.splashview__button').on('touchend mouseup', function () {
    window.santaApp.fire('sound-trigger', 'generic_button_click');
    this.emit('START_GAME');
    this.disableButtons();
  }.bind(this));
};


app.view.SplashView.prototype.disableButtons = function() {
  this.elem.find('.splashview__button').off('touchend mouseup');
};


app.view.SplashView.prototype.showView = function() {
  this.enableButtons();
  this.elem.show();
};


app.view.SplashView.prototype.hideView = function() {
  this.disableButtons();
  this.elem.hide();
};
