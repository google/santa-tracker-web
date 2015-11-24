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


goog.scope(function () {
  const Constants = app.Constants;
  const Dropper = app.world.Dropper;
  const Target = app.world.Target;
  const CandyCane = app.world.CandyCane;
  const ConveyorBelt = app.world.ConveyorBelt;
  const Spring = app.world.Spring;
  const SnowGlobe = app.world.SnowGlobe;


  /**
   * Level class
   */
  class Level {

    /**
     * @param {!Element} elem A DOM element which wraps the level.
     * @param {!Object} levelData Level configuration
     * @param {!Function} onCompleteCallback Callback function when level is completed
     * @export
     */
    constructor(game, elem, levelData, onCompleteCallback) {
      this.game_ = game;
      this.elem = $(elem);
      this.levelData_ = levelData;
      this.onCompleteCallback = onCompleteCallback;

      this.userObjects_ = [];
      this.levelObjects_ = [];
      this.world_ = null
      this.ball_ = null;
      this.dropper_ = null;
      this.target_ = null;
      this.isLevelLoaded_ = false;
      this.debug_ = !!location.search.match(/[?&]debug=true/);

      this.buildWorld_();

      // Adding collision detection
      const listener = new b2.ContactListener;
      listener.BeginContact = this.onBeginContact_;
      listener.EndContact = this.onEndContact_;
      listener.PostSolve = this.onPostSolve_;
      listener.PreSolve = this.onPreSolve_;

      this.world_.SetContactListener( listener );

      this.init_();
    }

    /**
     * Fired when two fixtures start contacting (aka touching) each other.
     * @param  {[type]} contact [description]
     * @return {[type]}         [description]
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
     * @param  {[type]} contact [description]
     * @return {[type]}         [description]
     */
    onEndContact_(contact) {
    }

    /**
     * Fired before contact is resolved. We have the opportunity to override the contact here.
     * @param  {[type]} contact     [description]
     * @param  {[type]} oldManifold [description]
     * @return {[type]}             [description]
     */
    onPreSolve_(contact, oldManifold) {
    }

    /**
     * Fired once the contact is resolved. The event also includes the impulse from the contact.
     * @param  {[type]} contact [description]
     * @param  {Array} impulse An array of impulse values for the collision
     */
    onPostSolve_(contact, impulse) {
    }

    positionWrapperElement_(el) {
      el.css({
        position: 'absolute',
        zIndex: 100,
        left: '50%',
        top: '50%',
        margin: '-' + (Constants.CANVAS_HEIGHT/2) + 'px 0 0 -' + (Constants.CANVAS_WIDTH/2) + 'px',
        width: Constants.CANVAS_WIDTH + 'px',
        height: Constants.CANVAS_HEIGHT + 'px'
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
            width: Constants.CANVAS_WIDTH,
            height: Constants.CANVAS_HEIGHT
          })
          .appendTo(this.elem);

        const debugDraw = new b2.DebugDraw();
        debugDraw.SetSprite( this.$debugCanvas_[0].getContext("2d") );
        debugDraw.SetDrawScale( Constants.PHYSICS_SCALE );
        debugDraw.SetFillAlpha( 0.3 );
        debugDraw.SetLineThickness( 1 );
        debugDraw.SetFlags( b2.DebugDraw.e_shapeBit | b2.DebugDraw.e_jointBit );
        this.world_.SetDebugDraw(debugDraw);
      }
    }

    /**
     * @private
     */
    init_() {
      this.isLevelLoaded_ = true;
      this.buildLevelObjects_();
      this.buildUserObjects_();
    }

    /**
     * @private
     */
    buildLevelObjects_() {
      this.dropper_ = new Dropper(this, this.world_, this.levelData_.dropper);
      this.target_ = new Target(this, this.world_, this.levelData_.target);
      this.levelObjects_.push(this.dropper_);
      this.levelObjects_.push(this.target_);

      for (let itemData of this.levelData_.fixedObjects) {
        const beam = new CandyCane(this, this.world_, itemData);
        this.levelObjects_.push(beam);
      }
    }

    /**
     * @private
     */
    buildUserObjects_() {
      for (let beltData of this.levelData_.conveyorBelts) {
        const belt = new ConveyorBelt(this, this.world_, beltData);
        this.userObjects_.push(belt);
      }
      for (let springData of this.levelData_.springs) {
        const spring = new Spring(this, this.world_, springData);
        this.userObjects_.push(spring);
      }
    }

    /**
     * @public
     */
    dropBall() {
      //debugEl.innerHTML = 'Debug: ball dropped';
      this.destroyBall();

      // create ball - use position from dropper
      const ballData = this.levelData_.ball;
      this.ball_ = new ballData.objectType(this, this.world_, ballData);
    }

    /**
     * @public
     */
    destroyBall() {
      if (this.ball_) {
        console.log('DESTROY BALL');
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
     * @private
     */
    hasBallExitedScreen_() {
      if (this.ball_) {
        return this.ball_.position().y > this.game_.getViewport().height;
      }
      return false;
    }

    /**
     * @private
     */
    hasBallHitTarget_() {
      // TODO detect collision with target and call this.onCompleteCallback(score);
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
        Constants.PHYSICS_TIME_STEP,
        Constants.PHYSICS_VELOCITY_ITERATIONS,
        Constants.PHYSICS_POSITION_ITERATIONS
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
    isGameFinished() {
      return this.hasBallHitTarget_();
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
     * Destroy level and all Box2D/DOM resources
     * @public
     */
    destroy() {
      this.isLevelLoaded_ = false;
      this.destroyBall();

      for (let object of this.levelObjects_) {
        object.destroy();
      }
      // loop through user placed objects
      for (let object of this.userObjects_) {
        object.destroy();
      }

      this.userObjects_ = [];
      this.levelObjects_ = [];
      this.world_ = null;

      if (this.$debugCanvas_) {
        this.$debugCanvas_.remove();
      }
    }
  }


  app.world.Level = Level;

});
