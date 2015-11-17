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

goog.provide('app.Level');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.Target');
goog.require('app.CandyCane');
goog.require('app.ConveyorBelt');
goog.require('app.Spring');
  
/**
 * Level class
 */
class Level {

  /**
   * @constructor
   * @param {!Element} elem An DOM element which wraps the game.
   * @param {!Object} levelData Level configuration
   * @param {!Function} onCompleteCallback Callback function when level is completed
   * @export
   */
  constructor(elem, levelData, onCompleteCallback) {
    this.elem = $(elem);
    this.levelData_ = levelData;
    this.onCompleteCallback = onCompleteCallback;

    this.userObjects_ = [];
    this.levelObjects_ = [];
    this.world_ = null
    this.ball_ = null;
    this.target_ = null;
    this.isLevelLoaded = false;
    this.debug = !!location.search.match(/[?&]debug=true/);

    console.log('New LEVEL');
    this.buildWorld_();
    this.init_();
  }

  /**
   * @private
   */
  buildWorld_() {
    this.world_ = new b2.World(
      new b2.Vec2(0, 0), // Now global gravity - apply on Ball instead
      true // allow sleep
    );

    if (this.debug) {
      var debugCanvas = $('<canvas>')
        .addClass('js-debug-canvas')
        .css({
          position: 'absolute',
          zIndex: 100,
          left: '50%',
          top: '50%',
          margin: '-' + (app.Constants.CANVAS_HEIGHT/2) + 'px 0 0 -' + (app.Constants.CANVAS_WIDTH/2) + 'px'
        })
        .attr({
          width: app.Constants.CANVAS_WIDTH,
          height: app.Constants.CANVAS_HEIGHT
        })
        .appendTo(this.viewElem);

      const debugDraw = new b2.DebugDraw();
      debugDraw.SetSprite( this.canvas_.getContext("2d") );
      debugDraw.SetDrawScale( app.Constants.PHYSICS_SCALE );
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
    this.isLevelLoaded = true;
    this.buildLevelObjects_();
    this.buildUserObjects_();
  }

  /**
   * @private
   */
  buildLevelObjects_() {
    this.target_ = new Target(this, this.world_, this.levelData_.target);
    this.levelObjects_.push(this.target_);

    for (let itemData of this.levelData_.fixedObjects) {
      const beam = new FixedBeam(this, this.world_, itemData);
      this.levelObjects_.push(beam);
    }
  }

  /**
   * @private
   */
  buildUserObjects_(levelData) {
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
  dropBall(ballData) {
    //debugEl.innerHTML = 'Debug: ball dropped';
    if (this.ball_) {
      this.ball_.destroy();
    }
    this.ball_ = new ballData.objectType(this, this.world_, ballData);
  }

  /**
   * @public
   */
  resetBall() {
    if (this.ball_) {
      this.ball_.destroy();
      this.ball_ = null;
    }
  }

  /**
   * @private
   */
  updateFrame_() {
    if (this.ball_) {
      this.ball_.update();
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
        this.ball_.destroy();
        this.ball_ = null;
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
    if (this.ball_ && this.ball_.y > SCREEN_Y_LIMIT) {
      //debugEl.innerHTML = 'Debug: ball has exited';
      return true;
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
   * @public
   */
  update() {
    // Let objects add custom Box2D forces
    this.updateFrame_();

    // update Box2D physics simulation
    this.world_.Step(
      1 / 60, // frame rate
      8, // velocity iteration
      3 // position iteration
    );

    // let Box2D draw it's world using canvas.
    if (this.debug) {
      this.world_.DrawDebugData();
    }
    
    // Draw all objects in the DOM
    this.drawFrame_();
    
    // Clear Box2D forces for next iteration
    this.world_.ClearForces();
  }

  /**
   * @public
   */
  isGameFinished() {
    return this.hasBallHitTarget_();
  }

  /**
   * Destroy level and all Box2D/DOM resources
   * @public
   */
  destroy() {
    this.isLevelLoaded = false;

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
  }
}

app.Level = Level;
