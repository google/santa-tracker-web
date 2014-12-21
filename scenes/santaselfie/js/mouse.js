goog.provide('app.Mouse');



/**
 * Global game mouse. Listens to mouse events on provided element
 * @param {jQuery} $elem The element
 * @constructor
 */
app.Mouse = function($elem) {
  var self = this;

  this.elem = $elem[0];
  this.rect = this.elem.getBoundingClientRect();
  this.down = false;
  this.x = 0;
  this.y = 0;
  this.relX = 0;
  this.relY = 0;

  this.subscribers = [];

  function calculateScale() {
    var originalWidth = 1920;
    var originalHeight = 985;

    var widthReductionFactor = 1420; // The game should get bigger as the width decreases.

    var width = $(window).width();
    var height = $(window).height();

    var scaleWidth = (width + widthReductionFactor) / (originalWidth + widthReductionFactor);
    var scaleHeight = height / originalHeight;
    var scaleFactor = Math.min(scaleWidth, scaleHeight);

    $elem.css({
      'font-size': scaleFactor
    });

    self.rect = self.elem.getBoundingClientRect();
    self.scaleFactor = scaleFactor;
  }

  $(window).on('resize.santaselfie orientationchange.santaselfie', function() {
    calculateScale();
    self.update();
  });

  calculateScale();

  $elem.on('mousemove', function(e) {
    self.x = e.clientX;
    self.y = e.clientY;

    e.preventDefault();
  });

  $elem.on('touchstart touchmove', function(e) {
    self.x = e.originalEvent.touches[0].clientX;
    self.y = e.originalEvent.touches[0].clientY;

    e.preventDefault();
  });

  $elem.on('mousedown touchstart', function(e) {
    self.down = true;

    e.preventDefault();
  });

  $elem.on('mouseup mouseleave touchend touchleave', function(e) {
    self.down = false;

    if (e.cancelable) {
      e.preventDefault();
    }
  });
};


/**
 * Subscribe to mouse and touch events
 * @param {Function} callback The callback to be called
 * @param {Object} context The value of this passed to the callback
 **/
app.Mouse.prototype.subscribe = function(callback, context) {
  this.subscribers.push({
    callback: callback,
    context: context
  });
};


/**
 * Notify subscribers of mouse updates. Called on animation frame.
 **/
app.Mouse.prototype.update = function() {
  var coordinates = this.transformCoordinates(this.x, this.y, this.rect);

  for (var i = 0; i < this.subscribers.length; i++) {
    this.subscribers[i].callback.call(this.subscribers[i].context, coordinates);
  }
};


/**
 * Transform coordinates relative to a client rect.
 * @param {Number} x The x coordinate
 * @param {Number} y The y coordinate
 * @param {ClientRect} rect A client rect to transform the coordinates relative to
 * @return {Object} mouse
 **/
app.Mouse.prototype.transformCoordinates = function(x, y, rect) {
  return {
    x: x - rect.left,
    y: y - rect.top,
    relX: 2 * x / rect.width - 1,
    relY: 2 * y / rect.height - 1,
    down: this.down,
    scale: this.scaleFactor
  };
};
