goog.provide('app.Player');

goog.require('app.PlayerSound');
goog.require('goog.style');

/**
 * Represents the maze player object.
 * @param {!Element} el root <g> for the player.
 * @param {!app.Map} map where player can move.
 * @constructor
 */
app.Player = function(el, map) {
  this.direction = 0;
  this.el = el;
  this.rotationEl = el.querySelector('.player__rotation');
  this.spriteEl = el.querySelector('.player__elf-sprite');
  this.victoryEl = el.querySelector('.player__victory');
  this.lostEl = el.querySelector('.player__lost');
  this.isLost = false;
  this.level = null;
  this.map = map;
  this.startDirection = 0;
  this.x = 0;
  this.y = 0;

  this.render_();
};

/**
 * How long should it take to move one cell in ms.
 * @type {number}
 */
app.Player.MOVE_DURATION = 400;

/**
 * How long should it take to rotate in ms.
 * @type {number}
 */
app.Player.ROTATE_DURATION = 200;

app.Player.prototype = {
  setLevel: function(level) {
    // Save starting direction if we're starting.
    this.startDirection = this.direction;
    this.level = level;

    this.restartLevel();

    this.render_();
  },

  restartLevel: function() {
    this.direction = this.startDirection;
    this.x = this.level.playerX;
    this.y = this.level.playerY;
  },

  render_: function() {
    goog.style.setStyle(this.el, 'transform', this.getTranslation_(this.x, this.y));
    goog.style.setStyle(this.rotationEl, 'transform', 'rotate(' + this.direction + 'deg)');
  },

  /**
   * Moves the player in an absolute direction.
   * @param {app.Direction} direction to go in.
   * @return {boolean} true if successful, false if blocked for any reason.
   */
  move: function(direction) {
    var oldDirection = this.direction;
    var oldX = this.x;
    var oldY = this.y;

    var radDirection = direction / 180 * Math.PI;
    var newX = this.x + Math.round(Math.sin(radDirection));
    var newY = this.y - Math.round(Math.cos(radDirection));
    var tile = this.map.getTile(newX, newY);
    if (tile === app.TileType.TREE || this.level.isOutsideBounds(newX, newY)) {
      return;
    }
    this.direction = direction;
    this.x = newX;
    this.y = newY;

    var animation = new AnimationGroup([
      app.PlayerSound.walk(),
      this.walkAnimation_(),
      new Animation(this.el, [
        {transform: this.getTranslation_(oldX, oldY)},
        {transform: this.getTranslation_(this.x, this.y)}
      ], {duration: app.Player.MOVE_DURATION, fill: 'forwards'})
    ], {duration: app.Player.MOVE_DURATION, fill: 'forwards'});
    return this.maybeRotateAnimation_(animation, oldDirection);
  },

  lose: function(direction) {
    var animation = new AnimationGroup([
      app.PlayerSound.lost(),
      new Animation(this.lostEl, [
        {opacity: 0, transform: 'scale(0.5)'},
        {offset: 0.3, opacity: 1, transform: 'scale(1)'},
        {opacity: 1, transform: 'scale(1)'}
      ], {duration: 800, fill: 'forwards'})
    ], {fill: 'forwards'});

    if (direction != null) {
      var oldDirection = this.direction;
      this.direction = direction;

      var radDirection = direction / 180 * Math.PI;
      var newX = this.x + Math.round(Math.sin(radDirection)) * 0.2;
      var newY = this.y - Math.round(Math.cos(radDirection)) * 0.2;

      animation = new AnimationSequence([
        new Animation(this.el, [
          {transform: this.getTranslation_(this.x, this.y)},
          {transform: this.getTranslation_(newX, newY)},
          {transform: this.getTranslation_(this.x, this.y)}
        ], {duration: app.Player.MOVE_DURATION * 0.4}),
        animation
      ], {fill: 'forwards'});
      animation = this.maybeRotateAnimation_(animation, oldDirection);
    }

    return animation;
  },

  maybeRotateAnimation_: function(animation, oldDirection) {
    if (oldDirection === this.direction) {
      return animation;
    }

    // WA-full does not figure out the shortest rotation.
    if (oldDirection < this.direction && this.direction - oldDirection > 180) {
      oldDirection += 360;
    } else if (oldDirection > this.direction && oldDirection - this.direction > 180) {
      oldDirection -= 360;
    }

    return new AnimationSequence([
      new AnimationGroup([
        app.PlayerSound.stop(),
        new Animation(this.rotationEl, [
          {transform: 'translateZ(0) rotate(' + oldDirection + 'deg)'},
          {transform: 'translateZ(0) rotate(' + this.direction + 'deg)'}
        ], {duration: app.Player.ROTATE_DURATION, fill: 'forwards'})
      ], {fill: 'forwards'}),
      animation
    ], {fill: 'forwards'});
  },

  pickUp: function(present) {
    return new AnimationGroup([
      app.PlayerSound.stop(),
      new Animation(present.el, [{opacity: 0}], {fill: 'forwards'}),
      new Animation(this.victoryEl, [{opacity: 1}], {fill: 'forwards'}),
      new Animation(this.spriteEl, [{opacity: 1}], {fill: 'forwards'})
    ], {duration: 800, fill: 'forwards'});
  },

  walkAnimation_: function() {
    return new Animation(this.spriteEl, [
      {transform: 'translateZ(0) translate(0, 0em)'},
      {transform: 'translateZ(0) translate(0, -52.8em)'}
    ], {duration: app.Player.MOVE_DURATION, easing: 'steps(8, end)', iterations: Infinity});
  },

  getTranslation_: function(x, y) {
    x = x * app.Scene.TILE_OUTER_SIZE + 4;
    y = y * app.Scene.TILE_OUTER_SIZE + 4;
    return 'translateZ(0) translate(' + x + 'em, ' + y + 'em)';
  }
};
