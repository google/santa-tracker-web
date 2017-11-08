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

goog.provide('app.view.DrawingCanvas');
goog.require('app.EventEmitter');
goog.require('Paper');

app.view.DrawingCanvas = function(container) {
  app.EventEmitter.call(this);

  // Canvas setup
  this.$canvas = container.find('.drawingCanvas');
  this.canvas = this.$canvas[0];

  // Drawing config
  var strokeColor = 'black';
  var strokeWidth = 7;
  var strokeCap = 'round';
  this.previousPos = null;

  paper.install(app);
  paper.setup(this.canvas);
  var tool = new paper.Tool();
  var path;

  tool.onMouseDown = function(event) {
    // If we produced a path before, deselect it:
    if (path) {
        path.selected = false;
    }

    // Create a new path and set its stroke color to black:
    path = new paper.Path({
        segments: [event.point],
        strokeColor: strokeColor,
        strokeCap: strokeCap,
        strokeWidth: strokeWidth
    });

    paper.view.draw();
  };

  tool.onMouseDrag = function(event) {
    path.add(event.point);
    path.smooth();
    paper.view.draw();
  };

  tool.onMouseUp = function(event) {
    path.smooth();
    paper.view.draw();
  };

  //this.resizeCanvas();

  // $(window).on('resize', function() {
  //   this.resizeCanvas();
  // }.bind(this));
};

app.view.DrawingCanvas.prototype = Object.create(app.EventEmitter.prototype);

app.view.DrawingCanvas.prototype.resizeCanvas = function() {
  var pCenter = paper.view.center;

  this.canvas.width = this.$canvas.width();
  this.canvas.height = this.$canvas.height();
  this.canvas.style.width = this.$canvas.width() + "px";
  this.canvas.style.height = this.$canvas.height() + "px";
  paper.view.viewSize = new paper.Size(this.canvas.width, this.canvas.height);

  paper.view.draw();
};
