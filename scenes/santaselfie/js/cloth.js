goog.provide('app.Cloth');

goog.require('app.Constants');
goog.require('app.Point');
goog.require('app.utils');



/**
 * Cloth simulation
 * @param {Canvas} canvas A canvas to render the cloth to.
 * @constructor
 */
app.Cloth = function(canvas) {
  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');
  this.hairCanvas = null;
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0
  };
  this.canPlaceDecoration = true;
  this.nearBeard = false;
};


app.Cloth.prototype.start = function() {
  this.hairShape = this.drawHairShape();
  this.points = this.drawInitialCloth();

  $(this.canvas).on('click.santaselfie touchend.santaselfie', this.addHair.bind(this));

  var self = this;

  $(window).on('resize.santaselfie', function() {
    self.hairShape = self.drawHairShape();
  });
};


/**
 * Resets the cloth to original state.
 */
app.Cloth.prototype.resetCloth = function() {
  this.points = this.drawInitialCloth();
};


/**
 * @extends {app.GameObject.mouseChanged}
 * @param {app.Mouse} mouse
 */
app.Cloth.prototype.mouseChanged = function(mouse) {
  var coordinates = game.mouse.transformCoordinates(mouse.x, mouse.y,
                                                    this.canvas.getBoundingClientRect());

  this.mouse.px = this.mouse.x;
  this.mouse.py = this.mouse.y;

  this.mouse.x = coordinates.x;
  this.mouse.y = coordinates.y;
  this.mouse.down = coordinates.down;

  if (!this.canPlaceDecoration) {
    // wait for mouse up before placing another decoration
    this.canPlaceDecoration = !mouse.down;
  }

  if (this.mouse.down && game.tools.selectedTool &&
      (game.tools.selectedTool.spray || game.tools.hairclean.isSelected ||
       game.tools.selectedTool.decoration || game.tools.clipper.isSelected)) {
    var scale = game.mouse.scaleFactor;
    var anyNearBeard = false;

    var i = this.points.length;
    while (i--) {
      if (!this.points[i].draw) {
        continue;
      }

      var differenceX = this.points[i].options.x * scale - this.mouse.x;
      var differenceY = this.points[i].options.y * scale - this.mouse.y;
      var dist = app.utils.distance(differenceX, differenceY);

      if (dist < app.Constants.SPACING * scale) {
        if (game.tools.clipper.isSelected) {
          this.nearBeard = true;
          anyNearBeard = true;
        }

        if (game.tools.selectedTool.spray) {
          this.points[i].spray = game.tools.selectedTool.spray;
        }

        if (game.tools.hairclean.isSelected) {
          this.points[i].spray = null;
          this.points[i].decoration = null;
        }

        if (game.tools.selectedTool.decoration && this.canPlaceDecoration) {
          this.points[i].decoration = game.tools.selectedTool.decoration;
          window.santaApp.fire('sound-trigger', 'selfie_item');
          this.canPlaceDecoration = false;
          break;
        }
      }
    }

    if (!anyNearBeard) {
      this.nearBeard = false;
    }
  }

  if (game.tools.selectedTool && game.tools.selectedTool.spray && mouse.down && mouse.x > 230) {
    app.utils.triggerStart('selfie_color');
  } else if (!mouse.down) {
    app.utils.triggerStop('selfie_color');
  }

  if (this.nearBeard && game.tools.clipper.isSelected && mouse.down) {
    app.utils.triggerStart('selfie_shave_cutting');
  } else if (!this.nearBeard || !mouse.down) {
    app.utils.triggerStop('selfie_shave_cutting');
  }
};

app.Cloth.prototype.drawInitialCloth = function() {
  var CANVAS_WIDTH = app.Constants.CANVAS_WIDTH;
  var CLOTH_WIDTH = app.Constants.CLOTH_WIDTH;
  var CLOTH_HEIGHT = app.Constants.CLOTH_HEIGHT;
  var SPACING = app.Constants.SPACING;
  var START_Y = app.Constants.START_Y;

  var points = [];
  var startX = CANVAS_WIDTH / 2 - CLOTH_WIDTH * SPACING / 2;

  for (var y = 0; y <= CLOTH_HEIGHT; y++) {
    for (var x = 0; x <= CLOTH_WIDTH; x++) {
      var constraints = [];

      if (x > 0) {
        constraints.push(points.length - 1);
      }

      if (y > 0) {
        constraints.push(x + (y - 1) * (CLOTH_WIDTH + 1));
      }

      var pointX = startX + x * SPACING;
      var pointY = START_Y + y * SPACING;
      var pinned = pointY < 5 ||
          app.utils.distance(pointX - CANVAS_WIDTH / 2, pointY - START_Y - 30) <
          (CLOTH_WIDTH + 2) * SPACING / 2;
      var radius = CLOTH_WIDTH / 2;
      var draw = y > CLOTH_HEIGHT - radius ?
          ((x - radius) * (x - radius) + (y - (CLOTH_HEIGHT - radius)) *
              (y - (CLOTH_HEIGHT - radius))) <
              radius * radius :
          true;

      var point = new app.Point({
        x: pointX,
        y: pointY,
        pinned: pinned,
        constraints: constraints,
        draw: draw
      });

      points.push(point);
    }
  }

  function drawSideburn(x, y) {
    var point = new app.Point({
      x: startX + x * SPACING,
      y: START_Y - y * SPACING,
      pinned: true
    });

    points.push(point);
  }

  // sideburns
  for (var y = 1; y < 5; y++) {
    for (var x = 0; x < 2; x++) {
      drawSideburn(x, y);
      drawSideburn(x + CLOTH_WIDTH - 1, y);
    }
  }

  function drawHair(x, y) {
    var point = new app.Point({
      x: startX + 60 + x * SPACING,
      y: START_Y - 165 - y * SPACING,
      pinned: true
    });

    points.push(point);
  }

  // hair
  for (var x = 3; x < 11; x++) {
    drawHair(x, 3);
  }

  for (var x = 3; x < 12; x++) {
    drawHair(x, 2);
  }

  for (var x = 4; x < 12; x++) {
    drawHair(x, 1);
  }

  for (var x = 5; x < 11; x++) {
    drawHair(x, 0);
  }

  return points;
};

app.Cloth.prototype.drawHairShape = function() {
  if (!this.hairCanvas) {
    this.hairCanvas = document.createElement('canvas');
  }
  var ctx = this.hairCanvas.getContext('2d');
  var scale = game.mouse.scaleFactor;

  this.hairCanvas.width = 53 * scale;
  this.hairCanvas.height = 52 * scale;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(47, 30);
  ctx.bezierCurveTo(46, 28, 49, 25, 49, 23);
  ctx.bezierCurveTo(48, 20, 47, 18, 46, 15);
  ctx.bezierCurveTo(44, 15, 46, 18, 40, 19);
  ctx.bezierCurveTo(41, 12, 34, 7, 34, 0);
  ctx.bezierCurveTo(31, 5, 30, 11, 31, 17);
  ctx.bezierCurveTo(28, 13, 23, 10, 22, 4);
  ctx.bezierCurveTo(19, 9, 19, 13, 18, 18);
  ctx.bezierCurveTo(13, 14, 6, 14, 0, 17);
  ctx.bezierCurveTo(4, 18, 9, 19, 11, 23);
  ctx.bezierCurveTo(9, 21, 2, 21, 0, 22);
  ctx.bezierCurveTo(9, 26, 10, 38, 17, 43);
  ctx.bezierCurveTo(17, 44, 12, 48, 11, 46);
  ctx.bezierCurveTo(13, 49, 19, 48, 22, 48);
  ctx.bezierCurveTo(23, 49, 26, 50, 27, 50);
  ctx.bezierCurveTo(32, 52, 28, 44, 33, 52);
  ctx.bezierCurveTo(33, 46, 37, 47, 39, 50);
  ctx.bezierCurveTo(39, 48, 38, 46, 37, 44);
  ctx.bezierCurveTo(42, 44, 46, 41, 49, 38);
  ctx.bezierCurveTo(47, 39, 44, 39, 43, 37);
  ctx.bezierCurveTo(44, 39, 53, 31, 53, 29);
  ctx.bezierCurveTo(51, 31, 49, 31, 47, 30);
  ctx.bezierCurveTo(47, 29, 48, 31, 47, 30);
  ctx.closePath();
  ctx.fill();

  return this.hairCanvas;
};

app.Cloth.prototype.update = function(timeSteps) {
  var i = app.Constants.PHYSICS_ACCURACY;

  while (i--) {
    var p = this.points.length;
    while (p--) {
      this.points[p].resolveConstraints(this.points);
    }
  }

  i = this.points.length;
  while (i--) {
    this.points[i].update(this.mouse);
  }
};

app.Cloth.prototype.draw = function() {
  var scale = game.mouse.scaleFactor;

  this.canvas.width = app.Constants.CANVAS_WIDTH * scale;
  this.canvas.height = app.Constants.CANVAS_HEIGHT * scale;

  var i = this.points.length;
  while (i--) {
    this.points[i].drawHair(this.hairShape, this.ctx, scale);
  }

  this.ctx.globalCompositeOperation = 'source-atop';

  i = this.points.length;
  while (i--) {
    this.points[i].drawSpray(this.ctx, scale);
  }

  this.ctx.globalCompositeOperation = 'source-over';

  i = this.points.length;
  while (i--) {
    this.points[i].drawDecoration(this.ctx, scale);
  }
};

app.Cloth.prototype.addHair = function() {
  if (!game.tools.hairgrow.isSelected) {
    return;
  }

  var scale = game.mouse.scaleFactor;
  var i = this.points.length;

  while (i--) {
    var differenceX = this.points[i].options.x * scale - this.mouse.x;
    var differenceY = this.points[i].options.y * scale - this.mouse.y;
    var dist = app.utils.distance(differenceX, differenceY);

    if (dist < app.Constants.ADD_DISTANCE) {
      this.points[i] = this.points[i].reset();
    }
  }
};
