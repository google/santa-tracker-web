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

goog.provide('app.GameController');
goog.require('app.EventEmitter');
goog.require('app.view.DrawingCanvas');
goog.require('app.DrawingRecognitionController');


app.GameController = function(container) {
  app.EventEmitter.call(this);

  this.recognitionController = new app.DrawingRecognitionController();

  //Views
  this.drawingCanvas = new app.view.DrawingCanvas(container);

  //Listeners
  this.drawingCanvas.addListener('DRAWING_UPDATED', function(data) {
    this.onDrawingUpdated(data);
  }.bind(this));
  this.recognitionController.addListener('NEW_RECOGNITIONS', function(guesses) {
    this.onNewRecognitions(guesses)
  }.bind(this));

  // Elem
  this.elem = container.find('.gameview');
  this.elem.hide();

  // Init
  this.resetGameRounds();
  this.newGuessesCounter = 0;
};


app.GameController.prototype = Object.create(app.EventEmitter.prototype);


app.GameController.prototype.prepareNewGame = function(callback) {
  console.log('GameController.prepareNewGame');
};


app.GameController.prototype.resetGameRounds = function() {
  this.presentedWords = [];
  this.previousRounds = [];
};


app.GameController.prototype.showView = function() {
  this.elem.show();
};


app.GameController.prototype.onDrawingUpdated = function(data) {
  this.recognitionController.onDrawingUpdated(data);
};


app.GameController.prototype.onNewRecognitions = function(recognitions) {
  //Set recognitions
};
