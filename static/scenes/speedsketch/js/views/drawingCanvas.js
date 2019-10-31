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
goog.require('app.Utils');

/**
 * @constructor
 */
app.view.DrawingCanvas = function(container) {
  app.EventEmitter.call(this);

  // Canvas setup
  this.$canvas = container.find('.drawingCanvas');
  this.canvas = this.$canvas[0];

  this.$pen = container.find('.whiteboard__pen');

  // Drawing config
  this.strokeColor = '#37414D';
  this.strokeWidth = 10;
  this.strokeCap = 'round';
  this.previousPos = null;
  this.paths = [];

  paper.install(this);
  paper.setup(this.canvas);
  this.tool_ = new paper.Tool();
  this.path = null;

  //sound
  this.lastMouseX = 0;
  this.lastMouseY = 0;
  this.lastTime = 1;
  this.drawingVolume = 0;

  this.resizeCanvas();

  $(window).on('resize', function() {
    this.resizeCanvas();
  }.bind(this));
};


app.view.DrawingCanvas.prototype = Object.create(app.EventEmitter.prototype);


app.view.DrawingCanvas.prototype.currentTimeMs = function() {
  if (!this.startTime) {
    return 0;
  }
  return (new Date()) - this.startTime;
};


app.view.DrawingCanvas.prototype.clearDrawingCanvas = function() {
  paper.project.activeLayer.removeChildren();
  this.resizeCanvas();

  delete this.startTime;
  this.paths = [];
};


app.view.DrawingCanvas.prototype.getSegments = function() {
  return this.paths;
};


app.view.DrawingCanvas.prototype.resizeCanvas = function() {
  if (window.matchMedia("(max-width: 767px)").matches) {
    this.canvas.width = this.$canvas.width();
    this.canvas.height = this.$canvas.parent().height();
    this.canvas.style.width = this.$canvas.width() + "px";
    this.canvas.style.height = this.$canvas.parent().height() + "px";
    paper.view.viewSize = new paper.Size(this.canvas.width, this.canvas.height);
  } else {
    this.canvas.width = this.$canvas.width();
    this.canvas.height = this.canvas.width * 594 / 1015;
    this.canvas.style.width = this.$canvas.width() + "px";
    this.canvas.style.height = (this.$canvas.width() * 594 / 1015) + "px";
    paper.view.viewSize = new paper.Size(this.canvas.width, this.canvas.height);
    this.$canvas.parent().css('padding-bottom', this.$canvas.width() * 594 / 1015);
  }

  paper.view.draw();
};

app.view.DrawingCanvas.prototype.startListening = function() {
  paper.view.on('mousemove', function(event) {
    if (this.canvas) {
      var x = event.point.x;
      var y = paper.view.viewSize.height - event.point.y;

      this.$pen.css({
        bottom: y + 1,
        left: x + 1
      });
    }
  }.bind(this));


  this.tool_.on('mousedown', function(event) {
    // If we produced a path before, deselect it:
    if (this.path) {
        this.path.selected = false;
    }

    // Create a new path and set its stroke color to black:
    this.path = new paper.Path({
        segments: [event.point],
        strokeColor: this.strokeColor,
        strokeCap: this.strokeCap,
        strokeWidth: this.strokeWidth
    });

    if (this.paths.length == 0) {
      this.startTime = new Date();
    }

    this.paths.push([[event.point.x], [event.point.y], [this.currentTimeMs()]]);

    paper.view.draw();

    window.santaApp.fire('sound-trigger', 'qd_marker_start');

  }.bind(this));

  this.tool_.on('mousedrag', function(event) {
    this.path.add(event.point);

    var arr = this.paths[this.paths.length - 1];
    if (arr[0].length == 0
      || Math.abs(arr[0][arr[0].length - 1] - event.point.x) > 4
      || Math.abs(arr[1][arr[1].length - 1] - event.point.y) > 4) {
      arr[0].push(event.point.x);
      arr[1].push(event.point.y);
      arr[2].push(this.currentTimeMs());
    }

    this.path.smooth();
    paper.view.draw();
    this.emit('DRAWING_UPDATED', this);

    this.calculateDrawingVolume(event.point)
  }.bind(this));

  this.tool_.on('mouseup', function(event) {
    this.path.smooth();
    paper.view.draw();
    this.emit('DRAWING_UPDATED', this);

    this.paths[this.paths.length - 1][0].push(event.point.x);
    this.paths[this.paths.length - 1][1].push(event.point.y);
    this.paths[this.paths.length - 1][2].push(this.currentTimeMs());

    window.santaApp.fire('sound-trigger', 'qd_marker_stop');
  }.bind(this));

};
app.view.DrawingCanvas.prototype.calculateDrawingVolume = function(point) {
  var xPos = Math.abs(point.x / this.canvas.width - this.lastMouseX);
  var yPos = Math.abs(point.y / this.canvas.height - this.lastMouseY);
  var speed = Math.abs(xPos+yPos) / ( (performance.now() / 1000 ) - this.lastTime);

  if (isFinite(speed)) {
    this.drawingVolume += speed / 2;
  }

  this.lastTime = performance.now() / 1000;
  this.lastMouseX = point.x / this.canvas.width;
  this.lastMouseY = point.y / this.canvas.height;

  this.soundUpdate();

}
app.view.DrawingCanvas.prototype.soundUpdate = function() {
  if (isFinite(this.drawingVolume)) {
    this.drawingVolume *= 0.6;
    window.santaApp.fire('sound-trigger', "qd_draw_update", Math.min(1, this.drawingVolume));
  }
}
app.view.DrawingCanvas.prototype.stopListening = function() {
  paper.view.off('mousemove');
  this.tool_.off('mousedown');
  this.tool_.off('mousedrag');
  this.tool_.off('mouseup');
};
