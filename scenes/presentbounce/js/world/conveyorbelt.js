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

goog.provide('app.world.ConveyorBelt');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.Unit');
goog.require('app.world.UserObject');

/**
 * ConveyorBelt class
 * Belt with user configurable surface velocity
 * @constructor
 * @extends app.world.UserObject
 */
app.world.ConveyorBelt = class extends app.world.UserObject {

  /**
   * @override
   */
  constructor(...args) {
    super(...args); // super(...arguments) doesn't work in Closure Compiler
    this.currentDirection_ = 1 //this.config_.beltDirection;
    this.path = this.$el_.find('.js-belt-path')[0];
    this.pathShadow = this.$el_.find('.js-belt-shadow-path')[0];
    this.offset = 0;
    this.pathLength = this.path.getTotalLength() || -813; // we just happened to know the length hehe :-)
    this.rAFID = null;
    this.body_ = this.buildBody_();
    this.BELT_SPEED = 2;
    this.isPaused = false;
    this.animateBelt_ = this.animateBelt_.bind(this);
  }

  /**
   *  Box2D Hack to add surface velocity on static body on active body
   */
  updateBeltDirection_(vector) {
    // setting private member since this.body_.SetLinearVelocity() doesn't work
    // probably checks the body type internally
    this.body_.m_linearVelocity = vector;
  }

  /**
   * Returns the belt direction in a Vector format
   * @param  {Number} direction direction can be -1 or 1
   * @return {Object}           Box2d vector format
   */
  getBeltDirectionVector_(direction = this.currentDirection_) {
    return new b2.Vec2(app.Constants.CONVEYOR_BELT_SPEED * direction, 0);
  }

  /**
   * Toogles the direction to go the opposite of its current direction.
   */
  toggleBeltDirection_() {
    this.currentDirection_ *= -1;
    this.updateBeltDirection_(this.getBeltDirectionVector_());
    window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_change_direction');
  }

  /**
   * Callback from the level
   * telling the objects that we are paused.
   */
  pause() {
    this.isPaused = true;
    this.pauseBelt_();
    window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_stop');
  }

  /**
   * Called from level
   * telling that we are continuing.
   */
  resume() {
    this.isPaused = false;
    this.resumeBelt_();
    window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_start');
  }

  /**
   * Play the belt. Alias for legibility purposes.
   */
  play() {
    this.resume();
  }

  /**
   * Pauses the conveyor belt.
   */
  pauseBelt_() {
    cancelAnimationFrame(this.rAFID);
    this.offset = this.pathLength; // reset offset
    this.updateBeltDirection_(this.getBeltDirectionVector_(0));
  }

  /**
   * Resumes the conveyor belt.
   */
  resumeBelt_() {
    // make sure we are not pilling animations
    cancelAnimationFrame(this.rAFID);
    this.animateBelt_();
    this.updateBeltDirection_(this.getBeltDirectionVector_());
  }

  /**
   * Animates the belt by upadting its strokeDashOffset
   */
  animateBelt_() {
    if (this.isPaused) return;

    // schedule next call
    this.rAFID = requestAnimationFrame(this.animateBelt_);

    // reset offset if necessary
    if(this.offset < 0) this.offset = this.pathLength;

    // change the dash offeset to look like it's moving
    this.path.style.strokeDashoffset = this.offset;
    this.pathShadow.style.strokeDashoffset = this.offset;

    // prepare the value for next time
    this.offset = this.offset - (this.BELT_SPEED * this.currentDirection_);
  }

  /**
   * Create horizontal plate fixture def
   * @return {Object} Box2d fixture object
   */
  getPlateFixtureDef_() {
    const fixDef = new b2.FixtureDef();
    const width = this.config_.style.width;
    const height = this.config_.style.height;
    fixDef.density = this.config_.material.density;
    fixDef.friction = this.config_.material.friction;
    fixDef.restitution = this.config_.material.restitution;
    fixDef.shape = new b2.PolygonShape();
    fixDef.shape.SetAsOrientedBox( app.Unit.toWorld(width/2 - height/2), app.Unit.toWorld(height/2), new b2.Vec2(0, 0), 0);
    return fixDef;
  }

  /**
   * Create rounded corner fixture def
   * @param  {Number} offsetPixels Number of pixels to offset this fixture
   * @return {Object}              Box2d fixture object
   */
  getCornerFixtureDef_(offsetPixels) {
    const fixDef = new b2.FixtureDef();
    fixDef.density = this.config_.material.density;
    fixDef.friction = this.config_.material.friction;
    fixDef.restitution = this.config_.material.restitution;
    fixDef.shape = new b2.CircleShape( app.Unit.toWorld(this.config_.style.height/2) );
    fixDef.shape.SetLocalPosition( new b2.Vec2(app.Unit.toWorld(offsetPixels), 0) );
    return fixDef;
  }

  /**
   * @private
   */
  buildBody_() {
    const bodyDef = new b2.BodyDef();
    const width = this.config_.style.width;
    const height = this.config_.style.height;

    bodyDef.type = b2.BodyDef.b2_staticBody;

    // Set start position based on mouse position in scene
    const mousePos = this.getMouseWorldVector(this.config_.mouseX, this.config_.mouseY);
    bodyDef.position.Set(mousePos.x, mousePos.y);

    // Box2D hack to simulate surface velocity on static body
    bodyDef.linearVelocity = this.getBeltDirectionVector_();

    const plateFixDef = this.getPlateFixtureDef_();
    const cornerLeftFixDef = this.getCornerFixtureDef_(-width/2 + height/2);
    const cornerRightFixDef = this.getCornerFixtureDef_(width/2 - height/2);

    const body = this.world_.CreateBody(bodyDef);

    const plateFix = body.CreateFixture(plateFixDef);
    const leftFix = body.CreateFixture(cornerLeftFixDef);
    const rightFix = body.CreateFixture(cornerRightFixDef);

    plateFix.collisionID = app.world.ConveyorBelt.COLLISION_ID;

    return body;
  }

  /**
   * Callback for the end of a user tap
   */
  onTapEnd() {
    this.toggleBeltDirection_();
  }

  /**
   * @inheritDoc
   */
  onUserInteractionStart() {
    super.onUserInteractionStart();
    // stop belt while dragging
    this.pause();
  }

  /**
   * @inheritDoc
   */
  onUserInteractionEnd() {
    super.onUserInteractionEnd();
    // Restore surface velocity after dragging
    this.resume();
  }

}

app.world.ConveyorBelt.COLLISION_ID = 'conveyorBeltFixture';
