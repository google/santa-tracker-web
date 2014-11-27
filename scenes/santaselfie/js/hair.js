goog.provide('app.Hair');

goog.require('app.Cloth');
goog.require('app.Constants');
goog.require('app.encoding');



/**
 * Creates container for Santa's beard.
 * Based on work Copyright (c) 2013 Suffick at Codepen (http://codepen.io/suffick),
 * GitHub (https://github.com/suffick) and lonely-pixel.com
 * @constructor
 * @param {jQuery} $elem The container element
 * @extends {app.GameObject}
 */
app.Hair = function($elem) {
  this.canvas = $elem.find('#beard')[0];
  this.cloth = new app.Cloth(this.canvas);
};


/**
 * @extends {app.GameObject.start}
 */
app.Hair.prototype.start = function() {
  game.mouse.subscribe(this.cloth.mouseChanged, this.cloth, this.canvas);

  this.cloth.start();
};


/**
 * Calculates the next state of the simulation
 */
app.Hair.prototype.update = function(delta) {
  this.cloth.update(delta);
};


/**
 * Draws the hair
 */
app.Hair.prototype.draw = function() {
  this.cloth.draw();
};


/**
 * Serialize the current state of the beard.
 * @return {String} encoded
 */
app.Hair.prototype.save = function() {
  var points = this.cloth.points;
  var encoder = app.Constants.ENCODER;
  var sprays = game.tools.sprays;
  var decorations = game.tools.decorations;

  var data = points.map(function(point) {
    var index = 0;

    if (point.draw) {
      index += 1;
    }

    if (point.draw && point.spray) {
      index += (sprays.indexOf(point.spray) + 1) * 5; // color + color with decoration * 4
    }

    if (point.draw && point.decoration) {
      index += decorations.indexOf(point.decoration) + 1;
    }

    return encoder[index];
  });

  return app.encoding.encode(data.join(''));
};


/**
 * Replace the current beard with a saved state.
 * @param {String} encoded string representing beard state.
 */
app.Hair.prototype.restore = function(encoded) {
  var encoder = app.Constants.ENCODER;
  var sprays = game.tools.sprays;
  var decorations = game.tools.decorations;

  var decoded = app.encoding.decode(encoded);

  var data = decoded.split('').map(function(char) {
    return encoder.indexOf(char);
  });

  var beardPoints = this.cloth.drawInitialCloth();

  for (var i = 0; i < beardPoints.length; i++) {
    beardPoints[i].draw = beardPoints[i].constrain = data[i] > 0;

    var spray = Math.floor((data[i] - 1) / 5);
    beardPoints[i].spray = spray > 0 ? sprays[spray - 1] : undefined;

    var decoration = (data[i] - 1) % 5;
    beardPoints[i].decoration = decoration > 0 ? decorations[decoration - 1] : undefined;
  }

  this.cloth.points = beardPoints;
};
