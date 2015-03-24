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

goog.require('app.GameManager');

goog.provide('app.Ornament');

/**
 * Class for Ornament game
 * @constructor
 * @param {string} selector String selector for DOM element
 * @param {!Element} elem The DOM element which wraps the game.
 */
app.Ornament = function(selector, elem) {
  this.elem = elem;
  this.isActive = false;

  this.canvas = elem.find(selector)[0];
  this.aspectRatio = 1;
  this.canvas.width = (window.devicePixelRatio || 1) * 560;
  this.canvas.height = this.canvas.width / this.aspectRatio;
  this.canvas.style.width = this.canvas.width * (1 / (window.devicePixelRatio || 1)) + 'px';
  this.canvas.style.height = this.canvas.height * (1 / (window.devicePixelRatio || 1)) + 'px';
  this.ctx = this.canvas.getContext('2d');
  this.ctx.lineJoin = 'round';
  this.ctx.lineCap = 'round';

  this.tempCanvas = $(this.canvas).prev()[0];
  this.tempCanvas.width = this.canvas.width;
  this.tempCanvas.height = this.canvas.height;
  this.tempCanvas.style.width = this.canvas.style.width;
  this.tempCanvas.style.height = this.canvas.style.height;
  this.tempCtx = this.tempCanvas.getContext('2d');

  this.dpr = (window.devicePixelRatio || 1);
  this.isDrawing = false;
  this.lastPoint = {};
  this.points = [];
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0
  };
  this.wrapperDelay = null;
  this.ornamentStage = $(this.canvas).parent();

  this.ornamentScene = this.ornamentStage.closest('.scene-ornament');
  this.ornamentWrapper = this.ornamentScene.parent();
  this.ornament = this.ornamentStage.closest('.ornament');
  this.ornamentCopy = this.ornamentScene.find('.ornament-copy');

  this.guideImg = this.ornamentScene.find('.color-guide')[0];
  this.logoImg = this.ornamentScene.find('.ornament-logo')[0];
  this.subjectCopy = this.ornamentScene.find('.ornament-copy-subject').text();
  this.moreInfoUrl = this.ornamentScene.find('.ornament-link').attr('href');

  this.ornamentAnim = null;
  this.ornamentCopyAnim = null;

  this.randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Init
 */
app.Ornament.prototype.init = function() {
  this.addEventListeners();
  this.resize();
};

/**
 * Add game event handlers
 */
app.Ornament.prototype.addEventListeners = function() {
  $(window).on({
    'resize.seasonofgiving': this.resize.bind(this),
    'touchend.seasonofgiving mouseup.seasonofgiving': this.globalMouseUp.bind(this),
    'touchstart.seasonofgiving mousedown.seasonofgiving': this.mouseDown.bind(this),
    'touchmove.seasonofgiving mousemove.seasonofgiving': this.mouseMove.bind(this)
  });

  this.elem.find('.Tool-bottomContainer').on('touchmove', function(event) {
    event.preventDefault();
  });
};

/**
 * Show ornament
 * @param {number} delayTime time delay to animate ornament in
 */
app.Ornament.prototype.show = function(delayTime) {
  var delayTime_ = delayTime || 0;

  this.isActive = true;
  window.clearTimeout(this.wrapperDelay);
  this.wrapperDelay = window.setTimeout(function() {
    this.ornamentWrapper.addClass('active');
    app.GameManager.navigation.handleResize();
  }.bind(this), delayTime * .5);

  if (delayTime_ < 2) {
    this.ornamentWrapper.css('transition-delay', '0s');
      if (app.GameManager.lastOrnamentObj) {
        app.GameManager.lastOrnamentObj.ornamentWrapper.css('transition-delay', '0s');
      }
  } else {
    this.ornamentWrapper.css('transition-delay', '0s');
    if (app.GameManager.lastOrnamentObj) {
      app.GameManager.lastOrnamentObj.ornamentWrapper.css('transition-delay', '0s');
    }
  }

  this.ornament.css('opacity', 0);
  this.ornamentCopy.css('opacity', 0);

  this.ornamentAnim && this.ornamentAnim.cancel();
  this.ornamentCopyAnim && this.ornamentCopyAnim.cancel();

  var tempAnimProps;
  if ($(window).width() > 1024) {
    tempAnimProps = [
      {transform: 'translate3d(0, 1500px, 0)', opacity: 0, offset: 0},
      {transform: 'translate3d(0, -20px, 0)', opacity: 1, offset: .6},
      {transform: 'translate3d(0, 10px, 0)', opacity: 1, offset: .75},
      {transform: 'translate3d(0, -5px, 0)', opacity: 1, offset: .9},
      {transform: 'translate3d(0, 0, 0)', opacity: 1, offset: 1}
    ];
  } else {
    tempAnimProps = [
      {transform: 'translate3d(-50%, -60%, 0)', opacity: 0, offset: 0},
      {transform: 'translate3d(-50%, -107%, 0)', opacity: 1, offset: .6},
      {transform: 'translate3d(-50%, -95%, 0)', opacity: 1, offset: .75},
      {transform: 'translate3d(-50%, -102%, 0)', opacity: 1, offset: .9},
      {transform: 'translate3d(-50%, -100%, 0)', opacity: 1, offset: 1}
    ];
  }

  this.ornamentAnim = this.ornament[0].animate(tempAnimProps, {
    fill: 'forwards',
    duration: $(window).width() > 1024 ? 1100 : 770,
    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
    delay: delayTime_
  });

  this.ornamentCopyAnim = this.ornamentCopy[0].animate([
    {opacity: 0, offset: 0},
    {opacity: 1, offset: .6},
    {opacity: 1, offset: .75},
    {opacity: 1, offset: .9},
    {opacity: 1, offset: 1}
  ], {
    fill: 'forwards',
    duration: 1000,
    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
    delay: delayTime * 1.2
  });
};

/**
 * Hide ornament
 */
app.Ornament.prototype.hide = function() {
  this.isActive = false;
};

/**
 * Cap numbers in a range
 * @param {number} num Current value
 * @param {number} min Minimum value
 * @param {number} max Maximum value
 * @return {number} Value between min and max
 */
app.Ornament.prototype.clamp = function(num, min, max) {
  return num < min ? min : (num > max ? max : num);
};

/**
 * Returns a relative num based on a range
 * @param {number} value Current value
 * @param {number} minA Minimum A value
 * @param {number} maxA Maximum A value
 * @param {number} minB Minimum B value
 * @param {number} maxB Maximum B value
 * @return {number} Relative value
 */
app.Ornament.prototype.relativeValue = function(value, minA, maxA, minB, maxB) {
  var rangeA = maxA - minA;
  var valueA = (value - minA) / rangeA;
  var rangeB = maxB - minB;
  var relativeValue = rangeB * valueA;
  return this.clamp(minB + relativeValue, minB, maxB);
};

/**
 * Resize + redraw ornament
 * @param {Event} event resize event
 */
app.Ornament.prototype.resize = function(event) {
  var rv = 0;

  if ($(window).width() > 1024) {
    rv = this.relativeValue($(window).width(), 1024, 1400, 230, 520);
    this.ornamentStage.css({
      'width': rv,
      'height': rv
    });

    $('.ornament', this.elem).css({
      'max-width': rv,
      'max-height': rv
    });
  } else {
    rv = this.relativeValue($(window).width(), 320, 1025, 230, 400);
    this.ornamentStage.css({
      'width': rv,
      'height': rv
    });

    $('.ornament', this.elem).css({
      'max-width': rv,
      'max-height': rv
    });
  }

  if (this.isActive) {
    this.show();
    app.GameManager.navigation.handleResize();
  }
  var outlineRect = this.ornamentStage[0].getBoundingClientRect();
  var tempWidth = 0;
  var tempHeight = 0;
  var canvas = this.canvas;
  var tempCanvas = this.tempCanvas;
  var ctx = this.ctx;
  var data = canvas.toDataURL();

  var img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  };
  img.src = data;

  if (outlineRect.width < outlineRect.height) {
    canvas.width = tempCanvas.width = (window.devicePixelRatio || 1) * outlineRect.width;
    canvas.height = tempCanvas.height = canvas.width / this.aspectRatio;
  } else {
    canvas.height = tempCanvas.height = (window.devicePixelRatio || 1) * outlineRect.height;
    canvas.width = tempCanvas.width = canvas.height / this.aspectRatio;
  }

  var newWidth = canvas.width * (1 / (window.devicePixelRatio || 1)) + 'px';
  var newHeight = canvas.height * (1 / (window.devicePixelRatio || 1)) + 'px';

  canvas.style.width = tempCanvas.style.width = newWidth;
  canvas.style.height = tempCanvas.style.height = newHeight;
};

/**
 * Global Mouse up - use to fix mouse/touch draw when leaving canvas
 */
app.Ornament.prototype.globalMouseUp = function() {
  if (!this.isActive) {
    return;
  }

  this.isDrawing = false;
  this.points.length = 0;
  $(this.tempCanvas).removeClass('temp-canvas--active');
  this.ctx.drawImage(this.tempCanvas, 0, 0);
  if (app.GameManager.tool) {
    app.GameManager.tool.el.css({'opacity': 1});
  }

  if (this.elem.find('.Tool--selected').hasClass('Tool-crayon--eraser')) {
    Klang.triggerEvent('spirit_eraser_end');
  } else {
    Klang.triggerEvent('spirit_crayon_end');
  }
};

/**
 * Mouse down handler
 * @param {MouseEvent} event ...
 */
app.Ornament.prototype.mouseDown = function(event) {
  if (!app.GameManager.tool || !this.isActive) {
    return;
  }

  if (this.elem.find('.Tool--selected').hasClass('Tool-crayon--eraser')) {
    Klang.triggerEvent('spirit_eraser_start');
  } else {
    Klang.triggerEvent('spirit_crayon_start');
  }

  this.isDrawing = true;

  var e = {};
  if (event.type === 'mousedown') {
    e.x = event.clientX;
    e.y = event.clientY;
  } else {
    e.x = event.originalEvent.touches[0].pageX;
    e.y = event.originalEvent.touches[0].pageY;
  }

  this.lastPoint = {
    x: e.x - this.canvas.getBoundingClientRect().left,
    y: e.y - this.canvas.getBoundingClientRect().top
  };

  this.randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  this.points.push(this.lastPoint);
  this.tempCtx.lineJoin = 'round';
  this.tempCtx.lineCap = 'round';
  this.tempCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.tempCtx.beginPath();
  var p1 = this.points[0];
  var p2 = this.points[1];
  this.tempCtx.moveTo(p1.x * this.dpr, p1.y * this.dpr);
  this.tempCtx.lineTo((p1.x + .1) * this.dpr, (p1.y + .1) * this.dpr);
  this.tempCtx.lineWidth = app.GameManager.sizeSlider.strokeSize;
  this.tempCtx.strokeStyle =
    app.GameManager.color !== 'rainbow' ? app.GameManager.color : this.randomColor;
  this.tempCtx.stroke();

  $(this.tempCanvas).addClass('temp-canvas--active');

  if (app.GameManager.tool) {
    app.GameManager.tool.el.css({'opacity': 0.8});
  }
};

/**
 * Mouse move handler
 * @param {MouseEvent} event ...
 */
app.Ornament.prototype.mouseMove = function(event) {
  if (!this.isDrawing || !this.isActive) {
    return;
  }

  var rect = this.canvas.getBoundingClientRect();
  var e = {};
  if (event.type === 'mousemove') {
    e.x = event.pageX;
    e.y = event.pageY;
  } else {
    e.x = event.originalEvent.touches[0].pageX;
    e.y = event.originalEvent.touches[0].pageY;
  }

  var currentPoint = {
    x: e.x - rect.left,
    y: e.y - rect.top
  };

  this.points.push(currentPoint);
  this.tempCtx.lineJoin = 'round';
  this.tempCtx.lineCap = 'round';
  this.tempCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  var p1 = this.points[0];
  var p2 = this.points[1];
  this.tempCtx.beginPath();
  this.tempCtx.moveTo(p1.x * this.dpr, p1.y * this.dpr);

  var dist = this.distanceBetween(this.lastPoint, currentPoint);
  var angle = this.angleBetween(this.lastPoint, currentPoint);
  var i = 0;
  var len = 0;
  var temp = {
    x: 0,
    y: 0
  };

  for (i = 0, len = this.points.length; i < len; i++) {
    var mp = midpoint(p1, p2);
    this.tempCtx.quadraticCurveTo(
      p1.x * this.dpr,
      p1.y * this.dpr,
      mp.x * this.dpr,
      mp.y * this.dpr
    );
    p1 = this.points[i];
    p2 = this.points[i + 1];
  }

  this.tempCtx.lineWidth = app.GameManager.sizeSlider.strokeSize;
  this.tempCtx.strokeStyle =
    app.GameManager.color !== 'rainbow' ? app.GameManager.color : this.randomColor;
  this.tempCtx.stroke();

  this.lastPoint = currentPoint;

  function midpoint(p1, p2) {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    };
  }
};

/**
 * Clear canvas
 */
app.Ornament.prototype.reset = function() {
  this.tempCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * Distance between 2 points
 * @param {{x: number, y: number}} point1 Start point
 * @param {{x: number, y: number}} point2 End point
 * @return {number} Returns distance between 2 points
 */
app.Ornament.prototype.distanceBetween = function(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

/**
 * Angle between 2 points
 * @param {{x: number, y: number}} point1 Start point
 * @param {{x: number, y: number}} point2 End point
 * @return {number} Returns angle of 2 points
 */
app.Ornament.prototype.angleBetween = function(point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
};
