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

goog.provide('app.view.GameView');
goog.require('app.EventEmitter');
goog.require('app.Utils');


/**
 * @constructor
 */
app.view.GameView = function(container) {
  app.EventEmitter.call(this);
  this.container = container;
  this.elem = container.find('.gameview');

  this.initListeners();
};


app.view.GameView.prototype = Object.create(app.EventEmitter.prototype);


app.view.GameView.prototype.initListeners = function() {
  this.elem
  .find('.gameview__clear-btn')
  .on('touchend mouseup', function() {
    this.emit('CLEAR');
  }.bind(this));
};


app.view.GameView.prototype.setCurrentWord = function(word) {
  this.elem.find('.helping-elf__secondary')
    .text(app.Utils.capitalize(app.Utils.getItemTranslation(this.container, word)));
};
