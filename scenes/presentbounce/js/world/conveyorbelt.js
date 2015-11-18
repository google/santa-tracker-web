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

    
  /**
   * ConveyorBelt class
   * Belt with user configurable surface velocity
   */
  class ConveyorBelt extends app.world.UserObject {
    
    /**
     * @override
     */
    constructor(...args) {
      super(...args);
      this.currentDirection_ = this.config_.beltDirection;
      this.body_ = this.buildBody_();
    }
    
    /** 
     *  Box2D Hack to add surface velocity on static body on active body
     */
    updateBeltDirection_() {
      // setting private member since this.body_.SetLinearVelocity() doesn't work
      // probably checks the body type internally
      this.body_.m_linearVelocity = this.getBeltDirectionVector_();
    }
    
    getBeltDirectionVector_(direction = this.currentDirection_) {
      return new b2.Vec2(app.Constants.CONVEYOR_BELT_SPEED * direction, 0);
    }
    
    toggleBeltDirection_() {
      this.currentDirection_ *= -1;
      this.el_.classList.toggle('js-animation-reverse', this.currentDirection_ === -1);
      this.body_.m_linearVelocity = this.getBeltDirectionVector_();
    }
    
    // create horizontal plate fixture def
    getPlateFixtureDef_() {
      const fixDef = new b2.FixtureDef();
      const {width, height} = this.config_.style;
      fixDef.density = this.config_.material.density;
      fixDef.friction = this.config_.material.friction;
      fixDef.restitution = this.config_.material.restitution;
      fixDef.shape = new b2.PolygonShape();
      fixDef.shape.SetAsOrientedBox( Unit.toWorld(width/2 - height/2), Unit.toWorld(height/2), new b2.Vec2(0, 0));
      return fixDef;
    }
    
    // create rounded corner fixture def
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
      const {width, height} = this.config_.style;
      
      bodyDef.type = b2.Body.b2_staticBody;
      bodyDef.position.Set(this.initialWorldPos_.x, this.initialWorldPos_.y);

      // Box2D hack to simulate surface velocity on static body
      bodyDef.linearVelocity = this.getBeltDirectionVector_();

      // object angle
      bodyDef.angle = this.config_.rotation * Math.PI / 180;

      const plateFixDef = this.getPlateFixtureDef_();
      const cornerLeftFixDef = this.getCornerFixtureDef_(-width/2 + height/2);
      const cornerRightFixDef = this.getCornerFixtureDef_(width/2 - height/2);

      const body = this.world_.CreateBody(bodyDef);
      body.CreateFixture(plateFixDef);
      body.CreateFixture(cornerLeftFixDef);
      body.CreateFixture(cornerRightFixDef);
      return body;
    }
    
    onTapEnd() {
      this.toggleBeltDirection_();
    }
    
    onDragEnd() {
      // Need to restore surface velocity after dragging
      this.updateBeltDirection_();
    }
  }


  app.world.ConveyorBelt = ConveyorBelt;

});