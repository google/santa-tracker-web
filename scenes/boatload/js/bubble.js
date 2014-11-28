goog.provide('Bubble');

goog.require('app.shared.pools');

/**
 * Bubbles from the motors of the boats.
 * @param {Game} game The game object.
 * @constructor
 */
Bubble = function(game) {
  this.game = game;
  this.elem = $('<div class="bubble hidden"></div>');
  this.elem[0].bubble = this;

  var type = Math.ceil(Math.random() * 6);
  this.elem.addClass('bubble--' + type);
  this.game.bubblesElem.append(this.elem);
}

pools.mixin(Bubble);

/**
 * Initialize bubble for reuse.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 * @param {number} speed The speed of the animation.
 */
Bubble.prototype.onInit = function(x, y, speed) {
  this.elem.addClass('animate').css({
    animation: 'bubble-left ' + speed / 12 * 1000 + 'ms',
    top: y,
    left: x,
    opacity: 0
  }).removeClass('hidden');
};

/**
 * Remove bubble.
 */
Bubble.prototype.onDispose = function() {
  this.elem.addClass('hidden').removeClass('animate')
      .css({
        top: -100,
        animation: '',
        opacity: 1
      });
};
