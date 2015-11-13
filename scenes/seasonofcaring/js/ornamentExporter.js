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

goog.provide('app.OrnamentExporter');

/**
 * Exports colored ornaments to png for printing or download.
 * @param {!app.Game} game
 * @param {string} componentDir
 * @constructor
 */
app.OrnamentExporter = function(game, componentDir) {
  this.canvas = $('<canvas>')[0];

  this.extension = app.GameManager.extension();
  // Preload export assets.
  this.ornamentImg = new Image();
  this.ornamentImg.crossOrigin = 'anonymous';
  this.ornamentImg.src = componentDir + 'img/download-ornament' + this.extension;
  this.compositeLogoImg = new Image();
  this.compositeLogoImg.crossOrigin = 'anonymous';
  this.compositeLogoImg.src = componentDir + 'img/print-st-logo' + this.extension;
  this.printGuideImg = new Image();
  this.printGuideImg.crossOrigin = 'anonymous';
  this.printGuideImg.src = componentDir + 'img/print-guide' + this.extension;
  this.printInstructionCopy = game.elem.find('.print-instructions-copy').text().trim();
  this.moreInformationCopy = game.elem.find('.more-information-copy').text().trim();
  this.santaTrackerCopy = game.elem.find('.santatracker-copy').text().trim();
};

/**
 * Constants for print layout.
 * @type {!Object}
 */
app.OrnamentExporter.PRINT_LAYOUT = {
  IMAGE_WIDTH: 3508,
  IMAGE_HEIGHT: 2480,
  VIEWPORT_WIDTH: 792,
  VIEWPORT_HEIGHT: 612,
  FOLD_X: 396,
  FOLD_Y_START: 146,
  FOLD_Y_END: 522,
  CIRCLE_X_LEFT: 229,
  CIRCLE_X_RIGHT: 563,
  CIRCLE_Y: 353,
  CIRCLE_RADIUS: 157,
  CIRCLE_STROKE: 12,
  LOGO_HEIGHT: 70,
  LOGO_WIDTH: 180,
  LOGO_X: 563 - 180 / 2, // CIRCLE_X_RIGHT - LOGO_WIDTH / 2,
  LOGO_Y: 224,
  INFO_Y: 357,
  INFO_LINE_HEIGHT: 17,
  ST_LINK_Y: 467,
  BG_X: 52,
  BG_Y: 39,
  INSTRUCTIONS_X: 396, // FOLD_X,
  INSTRUCTIONS_Y: 117,
  INSTRUCTIONS_LINE_HEIGHT: 14.4,
  INSTRUCTIONS_MAX_WIDTH: 200,
  INSTRUCTIONS_ENGLISH_WIDTH: 120
};

/**
 * Constants for download layout.
 * @type {!Object}
 */
app.OrnamentExporter.DOWNLOAD_LAYOUT = {
  ORNAMENT_WIDTH_RATIO: 1.0735,
  ORNAMENT_HEIGHT_RATIO: 1.5068,
  DRAWING_X_OFFSET: 0.0342,
  DRAWING_Y_OFFSET: 0.3119,
  SHADOW_WIDTH_RATIO: 1.0631,
  SHADOW_HEIGHT_RATIO: 1.0881,
  LOGO_FONT_RATIO: 0.025,
  COPY_MARGIN_RATIO: 0.0475,
  LOGO_Y: 0.82,
  LOGO_WIDTH_RATIO: 0.0542,
  LOGO_HEIGHT_RATIO: 0.0957,
  INFORMATION_FONT_RATIO: 0.0133
};

/**
 * Print a colored ornament with cutout guides.
 * Beware: Canvas layout of doom.
 * @type {!app.Ornament}
 * @param {!CanvasElement} ornament Canvas element
 */
app.OrnamentExporter.prototype.print = function(ornament) {
  var l = app.OrnamentExporter.PRINT_LAYOUT;
  this.canvas.width = l.IMAGE_WIDTH;
  this.canvas.height = l.IMAGE_HEIGHT;
  var ctx = this.canvas.getContext('2d');

  var drawing = ornament.canvas;

  // Clear canvas.
  ctx.clearRect(0, 0, l.IMAGE_WIDTH, l.IMAGE_HEIGHT);

  var scale = l.IMAGE_HEIGHT / l.VIEWPORT_HEIGHT;
  ctx.translate(l.IMAGE_WIDTH / 2 - scale * l.VIEWPORT_WIDTH / 2, 0);
  ctx.scale(scale, scale);

  // Draw drawing
  var drawingX = l.CIRCLE_X_LEFT - l.CIRCLE_RADIUS;
  var drawingY = l.CIRCLE_Y - l.CIRCLE_RADIUS;
  var drawingDiameter = l.CIRCLE_RADIUS * 2;
  this.drawDrawing_(ctx, drawing, ornament.guideImg, drawingX, drawingY, drawingDiameter);

  // Draw fold
  ctx.beginPath();
  ctx.moveTo(l.FOLD_X, l.FOLD_Y_START);
  ctx.lineTo(l.FOLD_X, l.FOLD_Y_END);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#D8D8D8';
  ctx.stroke();

  // Draw blue circles
  ctx.beginPath();
  ctx.arc(l.CIRCLE_X_LEFT, l.CIRCLE_Y,
          l.CIRCLE_RADIUS + l.CIRCLE_STROKE / 2, 0, 2 * Math.PI, false);
  ctx.lineWidth = l.CIRCLE_STROKE;
  ctx.strokeStyle = '#29B6F6';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(l.CIRCLE_X_RIGHT, l.CIRCLE_Y,
          l.CIRCLE_RADIUS + l.CIRCLE_STROKE / 2, 0, 2 * Math.PI, false);
  ctx.lineWidth = l.CIRCLE_STROKE;
  ctx.strokeStyle = '#29B6F6';
  ctx.stroke();

  // Draw ornament logo
  this.drawImageContained_(ctx, ornament.logoImg, l.LOGO_X, l.LOGO_Y,
                           l.LOGO_WIDTH, l.LOGO_HEIGHT, 0.5, 1);

  // Color logo black
  ctx.fillStyle = '#000000';
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillRect(l.LOGO_X, l.LOGO_Y, l.LOGO_WIDTH, l.LOGO_HEIGHT);
  ctx.globalCompositeOperation = 'source-over';

  // Draw print guides and decorations.
  ctx.drawImage(this.printGuideImg, l.BG_X, l.BG_Y);

  // Draw subject copy.
  ctx.font = '900 25px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#29B6F6';
  ctx.fillText(ornament.subjectCopy, l.CIRCLE_X_RIGHT, l.CIRCLE_Y - 20);

  // Draw link label.
  ctx.font = '700 11px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#29B6F6';
  ctx.fillText(this.moreInformationCopy, l.CIRCLE_X_RIGHT, l.INFO_Y);
  ctx.fillText(this.formatUrl_(ornament.moreInfoUrl),
               l.CIRCLE_X_RIGHT, l.INFO_Y + l.INFO_LINE_HEIGHT);

  // Draw santatracker link
  ctx.font = '700 7px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#29B6F6';
  ctx.fillText('santatracker.google.com', l.CIRCLE_X_RIGHT, l.ST_LINK_Y);

  // Draw instructions copy.
  var isEnglish = document.documentElement.lang.indexOf('en') === 0;
  var instructionsWidth = isEnglish ? l.INSTRUCTIONS_ENGLISH_WIDTH : l.INSTRUCTIONS_MAX_WIDTH;
  ctx.font = '900 12px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetical';
  ctx.fillStyle = '#424242';
  this.wrapText_(ctx, this.printInstructionCopy, l.INSTRUCTIONS_X, l.INSTRUCTIONS_Y,
                 instructionsWidth, -l.INSTRUCTIONS_LINE_HEIGHT);

  // Insert into new window, print, then close.
  var windowContent = '<!DOCTYPE html>';
  windowContent += '<html>';
  windowContent += '<head><title>' + window.document.title + '</title></head>';
  windowContent += '<body style="margin: 0;">';
  windowContent += '<img style="width: 100%;" src="' + this.canvas.toDataURL() + '">';
  windowContent += '</body>';
  windowContent += '</html>';
  var win = window.open();
  win.document.open();
  win.document.write(windowContent);
  win.document.close();
  win.addEventListener('load', printAndClose, false);

  function printAndClose() {
    win.focus();
    win.print();
    win.close();
  }
};

/**
 * Make a desktop wallpaper of a colored ornament for download.
 * Beware: Canvas layout of doom.
 * @type {!app.Ornament}
 * @param {!CanvasElement} ornament Canvas element
 */
app.OrnamentExporter.prototype.download = function(ornament) {
  var l = app.OrnamentExporter.DOWNLOAD_LAYOUT;
  var dpr = window.devicePixelRatio || 1;

  var width = window.screen.width;
  var height = window.screen.height;
  this.canvas.width = width * dpr;
  this.canvas.height = height * dpr;
  var ctx = this.canvas.getContext('2d');

  var drawing = ornament.canvas;

  // Clear canvas.
  ctx.clearRect(0, 0, width * dpr, height * dpr);

  // Deal with css pixels and scale up retina.
  ctx.scale(dpr, dpr);

  var drawingDiameter = drawing.width / dpr;
  var ornamentWidth = drawingDiameter * l.ORNAMENT_WIDTH_RATIO;
  var ornamentHeight = drawingDiameter * l.ORNAMENT_HEIGHT_RATIO;
  var ornamentX = width / 2 - ornamentWidth / 2;
  var ornamentY = height / 2 - ornamentHeight / 2;
  var drawingX = ornamentX + ornamentWidth * l.DRAWING_X_OFFSET;
  var drawingY = ornamentY + ornamentHeight * l.DRAWING_Y_OFFSET;

  // Draw drawing
  this.drawDrawing_(ctx, drawing, ornament.guideImg, drawingX, drawingY, drawingDiameter);

  // Green background
  ctx.rect(0, 0, width, height);
  ctx.fillStyle = '#7bb241';
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Ornament graphic.
  ctx.drawImage(this.ornamentImg, ornamentX, ornamentY,
                ornamentWidth * l.SHADOW_WIDTH_RATIO, ornamentHeight * l.SHADOW_HEIGHT_RATIO);

  // Measure and draw santatracker label.
  ctx.font = '' + (height * l.LOGO_FONT_RATIO) + 'px Lobster, sans-serif';
  var logoCopyWidth = ctx.measureText('Santa Tracker').width;
  var logoCenter = height * l.COPY_MARGIN_RATIO + logoCopyWidth / 2;
  var copyY = height - height * l.COPY_MARGIN_RATIO;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(this.santaTrackerCopy, logoCenter, copyY);

  // Draw santatracker logo.
  var logoImageWidth = height * l.LOGO_WIDTH_RATIO;
  var logoImageHeight = height * l.LOGO_HEIGHT_RATIO;
  var logoImageX = logoCenter - logoImageWidth / 2;
  var logoImageY = height * l.LOGO_Y;
  ctx.drawImage(this.compositeLogoImg, logoImageX, logoImageY, logoImageWidth, logoImageHeight);

  // Draw more information copy
  ctx.font = '900 ' + (height * l.INFORMATION_FONT_RATIO) + 'px Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  var copy = this.moreInformationCopy + ' ' + this.formatUrl_(ornament.moreInfoUrl);
  ctx.fillText(copy, width - height * l.COPY_MARGIN_RATIO, copyY);

  var windowContent = '<!DOCTYPE html>';
  windowContent += '<html>';
  windowContent += '<head><title>' + window.document.title + '</title></head>';
  windowContent += '<body style="margin: 0;">';
  windowContent += '<img style="width: 100%;" src="' + this.canvas.toDataURL() + '">';
  windowContent += '</body>';
  windowContent += '</html>';
  var tab = window.open();
  tab.document.write(windowContent);
};

/**
 * Masks and draws a drawing with guides.
 * @param {!CanvasRenderingContext2D} ctx
 * @param {!Image} drawingImg
 * @param {!Image} guideImg
 * @param {number} x
 * @param {number} y
 * @param {number} diameter
 * @private
 */
app.OrnamentExporter.prototype.drawDrawing_ = function(ctx, drawingImg, guideImg, x, y, diameter) {
  var radius = diameter / 2;
  var centerX = x + radius;
  var centerY = y + radius;

  // Create mask for drawing
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Draw drawing
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(drawingImg, x, y, diameter, diameter);
  ctx.globalCompositeOperation = 'source-over';

  // Draw guide
  ctx.drawImage(guideImg, x, y, diameter, diameter);
};

/**
 * Draws an image, contained and positioned inside a specified rectangle.
 * @param {!CanvasRenderingContext2D} context
 * @param {!Image} image
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} posX
 * @param {number} posY
 * @private
 */
app.OrnamentExporter.prototype.drawImageContained_ =
    function(context, image, x, y, width, height, posX, posY) {
  var baseX = x + width * posX;
  var baseY = y + height * posY;
  var targetHeight = height;
  var targetWidth = width;
  if (width / height > image.width / image.height) {
    targetWidth = image.width / image.height * targetHeight;
  } else {
    targetHeight = image.height / image.width * targetWidth;
  }
  context.drawImage(image, baseX - (targetWidth * posX), baseY - (targetHeight * posY),
                targetWidth, targetHeight);
};

/**
 * Formats a URL in a minimal way, skipping protocol and any slash/hash/query suffix.
 * @param {string} url
 * @return {string}
 * @private
 */
app.OrnamentExporter.prototype.formatUrl_ = function(url) {
  return url.
    // Trim protocol
    replace(/^[^:]+:\/\//, '').

    // Trim hash and query
    replace(/[#\?].+/, '').

    // Trim final slash
    replace(/\/$/, '');
};

/**
 * Canvas helper to draw wrapped text.
 * @param {!CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} wrapWidth
 * @param {number} lineHeight
 * @private
 */
app.OrnamentExporter.prototype.wrapText_ =
    function(ctx, text, x, y, wrapWidth, lineHeight) {
  var words = text.split(' ');
  var lines = [];
  var startY = y;
  var line = '';
  var reverse = lineHeight < 0;

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > wrapWidth && n > 0) {
      lines.push(line);
      startY += reverse ? lineHeight : 0;
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lineHeight = reverse ? -lineHeight : lineHeight;
  y = startY;
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y);
    y += lineHeight;
  }
};
