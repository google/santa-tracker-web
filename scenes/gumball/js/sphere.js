goog.provide('app.Sphere');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.shared.pools');

goog.scope(function() {
  var Constants = app.Constants;

  /**
   * A sphere.
   * @param {Game} game The game object.
   * @constructor
   */
  app.Sphere = function(game) {
    app.Sphere.counter = (app.Sphere.counter % 6) + 1;

    this.game = game;
    this.elem = $('<div class="sphere hidden" />').addClass('sphere--' + app.Sphere.counter);
    this.ballBody = null;
    this.collided = false;
    this.dead = false;
    this.initialX = null;
    this.soundFrameCounter = 0;

    this.elem.appendTo(this.game.spheresElem);
  };

  /**
   * Number of spheres.
   * @type {number}
   */
  app.Sphere.counter = 0;

  app.shared.pools.mixin(app.Sphere);

  /**
   * Initialize the sphere, might be for reuse.
   * @param {Number} x The X position.
   */
  app.Sphere.prototype.onInit = function(x) {
    this.dead = false;
    this.initialX = x;
    this.respawns = 0;

    // Physics model.
    var bd = new b2.BodyDef();
    bd.type = b2.Body.b2_dynamicBody;
    bd.userData = this;
    bd.active = false;
    this.ballBody = this.game.boxWorld.CreateBody(bd);

    var fixtureDef = new b2.FixtureDef();
    fixtureDef.userData = 'sphere';
    fixtureDef.shape = new b2.CircleShape(Constants.SPHERE_RADIUS * Constants.PHYSICS_SCALE);
    fixtureDef.density = 1;
    fixtureDef.restitution = 0.2;
    this.ballBody.CreateFixture(fixtureDef);
  };

  /**
   * Cleanup.
   */
  app.Sphere.prototype.onDispose = function() {
    this.game.boxWorld.DestroyBody(this.ballBody);
    this.ballBody.SetUserData(null);
    this.dead = true;

    this.elem.css('transform', '');
    this.elem.addClass('hidden');
  };

  /**
   * Spawn sphere.
   */
  app.Sphere.prototype.spawn = function() {
    this.elem.removeClass('hidden');
    this.respawnTimer = false;

    // In case two balls are spawned on exact same spot.
    var randomFactor = Math.random();
    this.ballBody.SetPositionAndAngle(new b2.Vec2((this.initialX + randomFactor) * Constants.PHYSICS_SCALE, 0), 0);
    this.ballBody.SetLinearVelocity(new b2.Vec2(0, 0));
    this.ballBody.SetAngularVelocity(0);
    this.ballBody.SetActive(true);
  };

  /**
   * Updates the sphere state.
   * @param {number} delta
   */
  app.Sphere.prototype.update = function(delta) {
    if (this.collided) {
      this.processCollision_();
    }

    if (this.respawnTimer !== false) {
      this.respawnTimer -= delta;
      if (this.respawnTimer < 0 && this.ballBody.IsActive()) {
        this.shouldRespawn_();
      }
    }
  };

  /**
   * Renders the sphere state.
   */
  app.Sphere.prototype.render = function() {
    var pos = this.ballBody.GetPosition();
    var angle = this.ballBody.GetAngle();

    this.elem.css('transform', 'translate3d(' + (pos.x / Constants.PHYSICS_SCALE) + 'px, ' + (pos.y / Constants.PHYSICS_SCALE) + 'px, 0) rotate(' + angle.toFixed(6) + 'rad)');

    // Update sound ca. 20 times per second.
    if (this.soundFrameCounter === 0) {
      this.updateSound_();
    }
    this.soundFrameCounter = (this.soundFrameCounter + 1) % 3;
  };

  /**
   * Triggers a sound event for the ball, based on speed and platform.
   * @private
   */
  app.Sphere.prototype.updateSound_ = function() {
    var c = this.ballBody.GetContactList();
    var isOnPlatform = false;
    var otherData;
    while (c && !isOnPlatform) {
      otherData = c.other.GetUserData();
      isOnPlatform = c.contact.IsTouching() && (otherData === 'board' || otherData === 'floor');
      c = c.next;
    }

    var velocityX = Math.min(1, Math.abs(this.ballBody.GetLinearVelocity().x) / 2);
    if (isOnPlatform === false) {
      velocityX = 0;
    }
    window.santaApp.fire('sound-trigger', {name: 'gb_ball_rolling', args: [velocityX]});
  };

  /**
   * Process registered collision.
   * @private
   */
  app.Sphere.prototype.processCollision_ = function() {
    if (this.collided === 'oob') {
      this.shouldRespawn_();
    } else if (this.collided === 'funnel') {
      window.santaApp.fire('sound-trigger', 'gb_ball_into_machine');
      var pos = this.ballBody.GetPosition();
      this.game.hitTarget(this, pos.x * 100, pos.y * 100);
      app.Sphere.push(this);
    }

    this.collided = false;
  };

  /**
   * Marks the ball for respawn.
   * @private
   */
  app.Sphere.prototype.shouldRespawn_ = function() {
    window.santaApp.fire('sound-trigger', 'gb_ballfallout');
    this.respawns++;
    this.ballBody.SetActive(false);
    this.game.spawner.spawnSphere(this);
  };

  /**
   * Event handler for collision in box2d. Runs inside box2d step().
   * @param {string} other userdata of collided object, either "oob" or "target"
   */
  app.Sphere.prototype.onContact = function(other) {
    // Process collisions after box2d has run.
    if (other === 'oob' || other === 'funnel') {
      this.collided = other;
    }

    if (other === 'target') {
      window.santaApp.fire('sound-trigger', 'gb_ball_bounce');
    }

    if (other === 'floor') {
      this.respawnTimer = Constants.SPHERE_RESPAWN_TIMER;
    }
  };
});
