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

goog.provide('app.world.PresentBall');

goog.require('b2');
goog.require('app.Unit');
goog.require('app.world.GravityObject');


goog.scope(function () {
  const Unit = app.Unit;
  

  /**
   * PresentBall class
   */
  class PresentBall extends app.world.GravityObject {
    
    /**
     * @override
     */
    constructor(...args) {
      super(...args); // super(...arguments) doesn't work in Closure Compiler
      this.body_ = this.buildBody_();
    }
    
    buildBody_() {
      const bodyDef = new b2.BodyDef();
      bodyDef.type = b2.BodyDef.b2_dynamicBody;
      bodyDef.position.Set(this.initialWorldPos_.x, this.initialWorldPos_.y);

      const fixDef = new b2.FixtureDef();
      const width = this.config_.style.width;
      const height = this.config_.style.height;
      fixDef.density = this.config_.material.density;
      fixDef.friction = this.config_.material.friction;
      fixDef.restitution = this.config_.material.restitution;
      fixDef.shape = new b2.PolygonShape();
      fixDef.shape.SetAsBox( Unit.toWorld(width/2), Unit.toWorld(height/2) );
   
      const body = this.world_.CreateBody(bodyDef);
      body.CreateFixture(fixDef);

      // trying to dampend rotation on belt
      body.SetAngularDamping(1.0);
      
      return body;
    }
  }


  app.world.PresentBall = PresentBall;

});