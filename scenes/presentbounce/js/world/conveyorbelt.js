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


goog.scope(function () {
  const Unit = app.Unit;
  const COLLISION_ID = 'conveyorBeltFixture';

  /**
   * ConveyorBelt class
   * Belt with user configurable surface velocity
   */
  class ConveyorBelt extends app.world.UserObject {

    /**
     * @override
     */
    constructor(...args) {
      super(...args); // super(...arguments) doesn't work in Closure Compiler
      this.currentDirection_ = 1//this.config_.beltDirection;
      this.body_ = this.buildBody_();
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
      this.$el_.toggleClass('js-animation-reverse', this.currentDirection_ === -1);
      this.updateBeltDirection_(this.getBeltDirectionVector_());
      window.santaApp.fire('sound-trigger', 'pb_conveyorbelt_change_direction');
    }

    /**
     * Pauses the conveyor belt.
     */
    pauseBelt_() {
      this.$el_.addClass('js-animation-paused');
      this.updateBeltDirection_(this.getBeltDirectionVector_(0));
    }

    /**
     * Resumes the conveyor belt.
     */
    resumeBelt_() {
      this.$el_.removeClass('js-animation-paused');
      this.updateBeltDirection_(this.getBeltDirectionVector_());
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
      fixDef.shape.SetAsOrientedBox( Unit.toWorld(width/2 - height/2), Unit.toWorld(height/2), new b2.Vec2(0, 0), 0);
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
      fixDef.shape = new b2.CircleShape( Unit.toWorld(this.config_.style.height/2) );
      fixDef.shape.SetLocalPosition( new b2.Vec2(Unit.toWorld(offsetPixels), 0) );
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

      plateFix.collisionID = COLLISION_ID;

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
      this.pauseBelt_();
    }

    /**
     * @inheritDoc
     */
    onUserInteractionEnd() {
      super.onUserInteractionEnd();
      // Restore surface velocity after dragging
      this.resumeBelt_();
    }

  }

  ConveyorBelt.COLLISION_ID = COLLISION_ID;

  app.world.ConveyorBelt = ConveyorBelt;

});