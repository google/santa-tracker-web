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

goog.provide('app.world.Spring');

goog.require('b2');
goog.require('app.Unit');
goog.require('app.world.UserObject');
goog.require('app.world.PresentBall');
goog.require('app.world.PresentSquare');
goog.require('app.shared.utils');

goog.scope(function () {
  const Unit = app.Unit;
  const PresentBall = app.world.PresentBall;
  const PresentSquare = app.world.PresentSquare;

  /**
   * Spring class
   * A very bouncy surface
   */
  class Spring extends app.world.UserObject {

    /**
     * @override
     */
    constructor(...args) {
      super(...args); // super(...arguments) doesn't work in Closure Compiler
      this.body_ = this.buildBody_();
      this.onCollision = this.onCollision.bind(this);
      this.registerForCollisions(this.onCollision);
    }

    /**
     * onCollision callback called from the Level.
     * @param  {Object} contact Contact containing both objects that are colliding.
     */
    onCollision(contact) {
      utils.animWithClass(this.$el_, 'animate');
      // check if it's a ball before playing 'boing' the sound
      if (contact &&
          contact.GetFixtureA().collisionID === PresentBall.COLLISION_ID   ||
          contact.GetFixtureA().collisionID === PresentSquare.COLLISION_ID ||
          contact.GetFixtureB().collisionID === PresentBall.COLLISION_ID   ||
          contact.GetFixtureB().collisionID === PresentSquare.COLLISION_ID
      ) {
        window.santaApp.fire('sound-trigger', 'pb_boing');
      }
    }

    /**
     * @inheritDoc
     */
    buildBody_() {
      const bodyDef = new b2.BodyDef();
      bodyDef.type = b2.BodyDef.b2_staticBody;

      // Set start position based on mouse position in scene
      const mousePos = this.getMouseWorldVector(this.config_.mouseX, this.config_.mouseY);
      bodyDef.position.Set(mousePos.x, mousePos.y);

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
      return body;
    }
  }


  app.world.Spring = Spring;

});