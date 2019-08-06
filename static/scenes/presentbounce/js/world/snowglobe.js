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

goog.provide('app.world.SnowGlobe');

goog.require('b2');
goog.require('app.Unit');
goog.require('app.world.GravityObject');

/**
 * SnowGlobe class
 * @constructor
 * @extends app.world.GravityObject
 */
app.world.SnowGlobe = class extends app.world.GravityObject {

  /**
   * @override
   */
  constructor(...args) {
    super(...args); // super(...arguments) doesn't work in Closure Compiler
    this.body_ = this.buildBody_();
  }

  /**
   * Builds the Box2d body with its fixtures.
   * @return {Object} Box2d body object.
   */
  buildBody_() {
    const radius = this.config_.style.width/2;
    const plateWidth = this.config_.style.width*0.4;
    const plateHeight = this.config_.style.height - this.config_.style.width;

    const bodyDef = new b2.BodyDef();
    bodyDef.type = b2.BodyDef.b2_dynamicBody;
    bodyDef.position.Set(this.initialWorldPos_.x, this.initialWorldPos_.y);

    // create snow globe
    const globeFixDef = new b2.FixtureDef();
    globeFixDef.density = this.config_.material.globeDensity;
    globeFixDef.friction = this.config_.material.friction;
    globeFixDef.restitution = this.config_.material.restitution;
    globeFixDef.shape = new b2.CircleShape( app.Unit.toWorld(radius) );
    globeFixDef.shape.SetLocalPosition( new b2.Vec2(0, app.Unit.toWorld(-plateHeight/2)) );

    // create base under globe
    const plateFixDef = new b2.FixtureDef();
    plateFixDef.density = this.config_.material.plateDensity; // heavier than the globe
    plateFixDef.friction = this.config_.material.friction;
    plateFixDef.restitution = this.config_.material.restitution;
    plateFixDef.shape = new b2.PolygonShape();
    plateFixDef.shape.SetAsOrientedBox( app.Unit.toWorld(plateWidth), app.Unit.toWorld(plateHeight), new b2.Vec2(0, app.Unit.toWorld(radius - plateHeight/2)), 0 );

    const body = this.world_.CreateBody( bodyDef );
    body.CreateFixture( globeFixDef );
    body.CreateFixture( plateFixDef );
    return body;
  }

}