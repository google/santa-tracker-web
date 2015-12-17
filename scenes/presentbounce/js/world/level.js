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
'use strict'

goog.provide('app.world.Level');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.world.Dropper');
goog.require('app.world.Target');
goog.require('app.world.CandyCane');
goog.require('app.world.ConveyorBelt');
goog.require('app.world.Spring');


/**
 * Level class
 * @constructor
 */
app.world.Level = class {

  /**
   * @param {!game} game the game instance
   * @param {!jQuery} elem A DOM element which wraps the level.
   * @param {!Object.<string>=} levelData Level configuration
   * @param {!Function(score) onCompleteCallback Callback function when level is completed
   * @param {!app.shared.tutorial} tutorial the tutorial instance
   * @param {!app.Scoreboard} scoreboard the scoreboard instance
   * @param {!app.Drawer} drawer the drawer instance
   * @export
   */
  constructor(game, elem, levelData, onCompleteCallback, tutorial, scoreboard, drawer) {
    this.game_ = game;
    this.elem = elem;
    this.levelData_ = levelData;
    this.onCompleteCallback = onCompleteCallback;

    this.tutorial = tutorial || null;
    this.scoreboard = scoreboard || null;
    this.drawer = drawer || null;

    this.$debugCanvas_ = null;

    this.userObjects_ = [];
    this.levelObjects_ = [];
    this.world_ = null
    this.ball_ = null;
    this.dropper_ = null;
    this.target_ = null;
    this.isLevelLoaded_ = false;
    this.debug_ = !!location.search.match(/[?&]debug=true/);
    this.hasInteractionStarted = false;

    this.hasFirstBeltDropped = false;
    this.hasBeltInteractionStarted = false;

    // Total ammount of objects available to be dragged and dropped
    this.numObjectsAvailable = 0;

    this.elem.css('visibility', 'hidden');
    this.buildWorld_();

    // Adding collision detection
    const listener = new b2.ContactListener;
    listener.BeginContact = this.onBeginContact_;
    listener.EndContact = this.onEndContact_;
    listener.PostSolve = this.onPostSolve_;
    listener.PreSolve = this.onPreSolve_;

    this.world_.SetContactListener(listener);

    // bind events
    this.onUserObjectDropped_ = this.onUserObjectDropped_.bind(this);
    this.onTestDropObject_ = this.onTestDropObject_.bind(this);
    this.onInteraction = this.onInteraction.bind(this);
    this.addEventListeners_();

    this.CLASS_PRESENT_STYLE_PREFIX = 'present--style-';
    this.CLASS_PRESENT_ACTIVE = 'present--active';

    this.init_();
  }

  /**
   * Adds event listeners on elements
   */
  addEventListeners_() {
    this.elem.on("click", this.onInteraction);
  }

  /**
   * Removes event listeners on elements
   */
  removeEventListeners_() {
    this.elem.off("click", this.onInteraction);
  }

  /**
   * Callback for when the level is completed.
   * Figures out the score and calls the game that this level is completed.
   */
  onLevelCompleted() {
    let score = 0;
    let currentTime = this.scoreboard.getCountdown();
    const BASE_POINTS = 50;
    const TIME_MODIFIDER = 30;

    this.hideBall();

    // Start with some base points
    score = BASE_POINTS;

    // Points based on speed:
    // the smaller the currentTime, the bigger the score should be
    score *= Math.max(TIME_MODIFIDER/currentTime, 0);

    // More points if using less tools
    score += (this.numObjectsAvailable * BASE_POINTS);

    // Calls the game complete callback
    this.onCompleteCallback( Math.round(score) );
  }

  /**
   * Hides the ball by changing it's visibility.
   */
  hideBall() {
    this.ball_.$el_.css('visibility', 'hidden');
    this.ball_.$shadowEl_.css('visibility', 'hidden');
  }

  /**
   * Fired when two fixtures start contacting (aka touching) each other.
   * @param  {Object} contact object with A and B fixtures given by box2d
   */
  onBeginContact_(contact) {
    const bodyA = contact.GetFixtureA().GetBody();
    const bodyB = contact.GetFixtureB().GetBody();

    if (bodyA && typeof bodyA.collisionCallback === 'function') {
      bodyA.collisionCallback(contact);
    }

    if (bodyB && typeof bodyB.collisionCallback === 'function') {
      bodyB.collisionCallback(contact);
    }
  }

  /**
   * Fired when two fixtures cease contact.
   * @param  {Object} contact object with A and B fixtures given by box2d
   */
  onEndContact_(contact) {}

  /**
   * Fired before contact is resolved. We have the opportunity to override the contact here.
   * @param  {Object} contact object with A and B fixtures given by box2d
   * @param  {Object} oldManifold A copy of the old manifold so that we can detect changes.
   */
  onPreSolve_(contact, oldManifold) {}

  /**
   * Fired once the contact is resolved. The event also includes the impulse from the contact.
   * @param  {Object} contact object with A and B fixtures given by box2d
   * @param  {Array} impulse An array of impulse values for the collision
   */
  onPostSolve_(contact, impulse) {}

  /**
   * Postions the element's container in the screen
   * given the information we know about the canvas.
   * @param  {Object} el The object the be positioned
   */
  positionWrapperElement_(el) {
    el.css({
      position: 'absolute',
      zIndex: 100,
      left: '50%',
      top: '50%',
      margin: '-' + (app.Constants.CANVAS_HEIGHT / 2) + 'px 0 0 -' + (app.Constants.CANVAS_WIDTH / 2) + 'px',
      width: app.Constants.CANVAS_WIDTH + 'px',
      height: app.Constants.CANVAS_HEIGHT + 'px'
    });
  }

  /**
   * @private
   */
  buildWorld_() {
    this.world_ = new b2.World(
      new b2.Vec2(0, 0), // Now global gravity - apply on Ball instead
      true // allow sleep
    );

    // set dimensions of DOM wrapper
    this.positionWrapperElement_(this.elem);

    if (this.debug_) {
      this.$debugCanvas_ = $('<canvas>')
          .addClass('js-debug-canvas')
          .attr({
              width: app.Constants.CANVAS_WIDTH,
              height: app.Constants.CANVAS_HEIGHT
          })
          .appendTo(this.elem);

      const debugDraw = new b2.DebugDraw();
      debugDraw.SetSprite(this.$debugCanvas_[0].getContext("2d"));
      debugDraw.SetDrawScale(app.Constants.PHYSICS_SCALE);
      debugDraw.SetFillAlpha(0.3);
      debugDraw.SetLineThickness(1);
      debugDraw.SetFlags(b2.DebugDraw.e_shapeBit | b2.DebugDraw.e_jointBit);
      this.world_.SetDebugDraw(debugDraw);
    }
  }

  /**
   * @private
   */
  init_() {
    this.isLevelLoaded_ = true;
    this.drawer.reset();
    this.buildLevelObjects_();
    this.buildUserObjects_();
    window.setTimeout( () => {
      this.show_();
    }, 50);
  }

  /**
   * @private
   * Shows the level once ready.
   */
  show_() {
    this.elem.css('visibility', 'visible');
  }

  /**
   * @private
   */
  buildLevelObjects_() {
    this.dropper_ = new app.world.Dropper(this, this.world_, this.levelData_.dropper);
    this.target_ = new app.world.Target(this, this.world_, this.levelData_.target);
    this.levelObjects_.push(this.dropper_);
    this.levelObjects_.push(this.target_);

    for (let itemData of this.levelData_.fixedObjects) {
      const beam = new app.world.CandyCane(this, this.world_, itemData);
      this.levelObjects_.push(beam);
    }
  }

  /**
   * @private
   */
  buildUserObjects_() {
    for (let beltData of this.levelData_.conveyorBelts) {
      this.drawer.add(beltData, app.Constants.USER_OBJECT_TYPE_BELT, this.onUserObjectDropped_, this.onTestDropObject_);
      this.numObjectsAvailable++;
    }
    for (let springData of this.levelData_.springs) {
      this.drawer.add(springData, app.Constants.USER_OBJECT_TYPE_SPRING, this.onUserObjectDropped_, this.onTestDropObject_);
      this.numObjectsAvailable++;
    }

    this.drawer.updateDrawersVisibility();
  }

  toggleBeltTutorial_() {
    if (!this.hasFirstBeltDropped) {
      this.hasFirstBeltDropped = true;
      window.setTimeout(() => { this.tutorial.show_('conveyor-switch') }, 500);
    }
  }

  /**
   * Callback from the drawer to create the World object when dropped inside the level
   * @private
   */
  onUserObjectDropped_(objectData, objectType, position, callback) {
    objectData.mouseX = position.x;
    objectData.mouseY = position.y;
    let hasError = false;
    if (objectType === app.Constants.USER_OBJECT_TYPE_BELT) {
      const belt = new app.world.ConveyorBelt(this, this.world_, objectData);
      if (belt.isBoundingBoxOverlappingOtherObject()) {
        belt.destroy();
        hasError = true;
      }
      else {
        hasError = false;
        this.userObjects_.push(belt);
        window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_start');
        belt.play();
        this.toggleBeltTutorial_();
      }
      callback( hasError );
    }
    else if (objectType === app.Constants.USER_OBJECT_TYPE_SPRING) {
      const spring = new app.world.Spring(this, this.world_, objectData);
      if (spring.isBoundingBoxOverlappingOtherObject()) {
        spring.destroy();
        hasError = true;
      }
      else {
        hasError = false;
        this.userObjects_.push(spring);
      }
      callback( hasError );
    }
  }

  /**
   * Callback from the drawer to test dropping an object
   * Temporarily create object, test for overlap, and then destroy the object
   * @private
   * @param {object} objectData Config data of this object.
   * @param {string} objectType What type of user object this is.
   * @param {object} position Current x and y positions of this object.
   * @param {function} validCallback Callback function to be called if this is valid.
   */
  onTestDropObject_(objectData, objectType, position, validCallback) {
    objectData.mouseX = position.x;
    objectData.mouseY = position.y;
    if (objectType === app.Constants.USER_OBJECT_TYPE_BELT) {
      const belt = new app.world.ConveyorBelt(this, this.world_, objectData);
      validCallback( !belt.isBoundingBoxOverlappingOtherObject() );
      belt.destroy();
    }
    else if (objectType === app.Constants.USER_OBJECT_TYPE_SPRING) {
      const spring = new app.world.Spring(this, this.world_, objectData);
      validCallback( !spring.isBoundingBoxOverlappingOtherObject() );
      spring.destroy();
    }
  }

  /**
   * @public
   */
  dropBall() {
    const randomInt = this.randomIntFromInterval(0, 3);

    this.destroyBall();

    // create ball - use position from dropper
    const ballData = this.levelData_.ball;
    this.ball_ = new ballData.objectType(this, this.world_, ballData);

    window.setTimeout(() => {
      this.ball_
        .$el_
        .addClass( this.CLASS_PRESENT_ACTIVE )
        .addClass( this.CLASS_PRESENT_STYLE_PREFIX + randomInt);

      this.ball_
          .$shadowEl_
          .addClass( this.CLASS_PRESENT_ACTIVE );
    }, 50);
  }

  /**
   * Gets a random intenger given a range.
   * @param  {Number} min The mininum possible integer
   * @param  {Number} max The maximum possible integer
   * @return {Number}     The randomized integer
   */
  randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  /**
   * @public
   */
  destroyBall() {
    if (this.ball_) {
      this.ball_.destroy();
      this.ball_ = null;
    }
  }

  /**
   * Returns the overall Game scene transform scale
   * @public
   */
  getViewport() {
    // scaled is stored on DOM element in Game class
    return this.game_.getViewport();
  }

  /**
   * @private
   */
  updateFrame_() {
    if (this.ball_) {
      this.ball_.update();
    }
    // loop through fixed level objects
    for (let object of this.levelObjects_) {
      object.update();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.update();
    }
  }

  /**
   * @private
   */
  drawFrame_() {
    if (this.ball_) {
      this.ball_.draw();
      if (this.hasBallExitedScreen_()) {
        this.destroyBall();
        window.santaApp.fire('sound-trigger', 'pb_ball_fallout');
      }
    }
    // loop through fixed level objects
    for (let object of this.levelObjects_) {
      object.draw();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.draw();
    }
  }

  /**
   * When the first user interaction happens on the scene.
   */
  onInteraction() {
    if (!this.hasInteractionStarted) {
      this.hasInteractionStarted = true;
      this.tutorial.off('device-tilt');
      this.tutorial.off('drag-and-drop');
    }
    if (this.hasFirstBeltDropped && !this.hasBeltInteractionStarted) {
      this.hasBeltInteractionStarted = true;
      this.tutorial.hide_();
      this.tutorial.off('conveyor-switch');
    }
  }

  /**
   * @private
   */
  hasBallExitedScreen_() {
    if (this.ball_) {
      return this.ball_.position().y > this.game_.getViewport().height*1.3;
    }
    return false;
  }

  /**
   * Game loop. Should be called every frame using requestAnimationFrame.
   * Updates Box2D state since last frame.
   * @param {number} totalDelta Time since last frame.
   * @public
   */
  onFrame(totalDelta) {
    // Let objects add custom Box2D forces
    this.updateFrame_();

    // update Box2D physics simulation
    // Box2D manual recommends a "fixed time step":
    // "We also don't like the time step to change much. A variable time step
    //  produces variable results, which makes it difficult to debug.
    //  So don't tie the time step to your frame rate (unless you really,
    //  really have to). " (http://www.box2d.org/manual.html)
    this.world_.Step(
      app.Constants.PHYSICS_TIME_STEP,
      app.Constants.PHYSICS_VELOCITY_ITERATIONS,
      app.Constants.PHYSICS_POSITION_ITERATIONS
    );

    // Draw all objects in the DOM
    this.drawFrame_();

    // Clear Box2D forces for next iteration
    this.world_.ClearForces();

    // let Box2D draw it's world using canvas.
    if (this.debug_) {
      this.world_.DrawDebugData();
    }
  }

  /**
   * @public
   */
  onUserInteractionStart() {

    // user not allowed to play while moving stuff
    this.destroyBall();

    for (let object of this.levelObjects_) {
      object.onUserInteractionStart();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.onUserInteractionStart();
    }
  }

  /**
   * @public
   */
  onUserInteractionEnd() {
    for (let object of this.levelObjects_) {
      object.onUserInteractionEnd();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.onUserInteractionEnd();
    }
  }

  /**
   * Helper to check if game is paused
   * @public
   */
  isGamePaused() {
    return this.game_.paused;
  }

  /**
   * Since the level is paused,
   * pass on this state to all objects.
   */
  pause() {
    for (let object of this.levelObjects_) {
      object.pause();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.pause();
    }
  }

  /**
   * Since the level is resuming,
   * pass on this state to all objects.
   */
  resume() {
    for (let object of this.levelObjects_) {
      object.resume();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.resume();
    }
  }

  /**
   * Destroy level and all Box2D/DOM resources
   * @public
   */
  destroy() {
    this.isLevelLoaded_ = false;
    this.destroyBall();
    this.removeEventListeners_();

    window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_stop');

    for (let object of this.levelObjects_) {
      object.destroy();
    }
    // loop through user placed objects
    for (let object of this.userObjects_) {
      object.destroy();
    }
    this.userObjects_.length = 0;
    this.levelObjects_.length = 0;
    this.world_ = null;

    window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_stop');
    if (this.$debugCanvas_) {
      this.$debugCanvas_.remove();
    }
  }
}
