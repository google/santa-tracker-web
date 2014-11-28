goog.require('app.Constants');
goog.provide('app.Spawner');

/**
 * Maintains the top pipe. It has a queue of balls to spawn and moves
 * around on a rail to spawn them.
 * @param {Game} game The game instance.
 * @param {jQuery} elem The ceilingPipe dom element.
 * @constructor
 */
app.Spawner = function(game, elem) {
  this.game = game;
  this.elem = elem;
  this.performSpawn_ = this.performSpawn_.bind(this);
  this.goToNextSpawn_ = this.goToNextSpawn_.bind(this);
  this.reset();
};

/**
 * Resets the spawner for game start.
 */
app.Spawner.prototype.reset = function() {
  this.x = 600;
  /** @type {app.Sphere[]} */
  this.queue = [];
  this.render();
};

/**
 * Adds a sphere to the spawn queue.
 * @param {app.Sphere} sphere
 */
app.Spawner.prototype.spawnSphere = function(sphere) {
  this.queue.push(sphere);
  if (this.queue.length === 1) {
    this.goToNextSpawn_();
  }
};

/**
 * Starts spawning next sphere. Moving if neccessary.
 * @private
 */
app.Spawner.prototype.goToNextSpawn_ = function() {
  var sphere = this.queue[0];
  if (!sphere) { return; }

  var distance = Math.abs(sphere.initialX - this.x);
  if (distance < 1) {
    this.performSpawn_();
    return;
  }

  var that = this;
  var originalX = this.x;
  Coordinator.step(distance / app.Constants.SPAWNER_VELOCITY, function(per) {
    that.x = originalX + (sphere.initialX - originalX) * per;
  }, this.performSpawn_);
};

/**
 * Actually spawns the ball.
 * @private
 */
app.Spawner.prototype.performSpawn_ = function() {
  this.queue[0].spawn();
  var that = this;

  window.santaApp.fire('sound-trigger', 'gb_new_ball');
  utils.animWithClass(this.elem, 'toggle-lever', function() {
    that.queue.shift();
    that.goToNextSpawn_();
  });
};

/**
 * Render spawner.
 */
app.Spawner.prototype.render = function() {
  this.elem.css('transform', 'translate3d(' + this.x + 'px, 0, 0)');
};
