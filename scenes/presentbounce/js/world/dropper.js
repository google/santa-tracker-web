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

goog.provide('app.world.Dropper');

goog.require('b2');
goog.require('app.InputEvent');
goog.require('app.Unit');
goog.require('app.world.LevelObject');


goog.scope(function () {
  const Unit = app.Unit;


  /**
   * Dropper class
   * Where the ball comes out
   */
  class Dropper extends app.world.LevelObject {

    /**
     * @override
     */
    constructor(...args) {
      super(...args); // super(...arguments) doesn't work in Closure Compiler
      this.body_ = this.buildBody_();
      this.$button_ = this.$el_.find('.js-dropper__button');

      this.onDropClick = this.onDropClick.bind(this);
      this.addEventListeners_();
    }

    /**
     * Add input event listeners
     */
    addEventListeners_() {
      this.$button_.on(app.InputEvent.START, this.onDropClick);
    }

    /**
     * Removes input even listeners
     */
    removeEventListeners_() {
      this.$button_.off(app.InputEvent.START, this.onDropClick);
    }

    /**
     * Callback for when the CTA button is clicked
     * to cause a drop to happen.
     */
    onDropClick() {
      if ( !this.level_.isGamePaused() ) {
        this.level_.dropBall();
        this.level_.onInteraction();
        window.santaApp.fire('sound-trigger', 'pb_button');
        window.santaApp.fire('sound-trigger', 'pb_present_fall');
      }
    }


    buildButtonFixture_(body, material, worldHeight, worldWidth) {
      const buttonFixDef = new b2.FixtureDef();
      buttonFixDef.density = material.globeDensity;
      buttonFixDef.friction = material.friction;
      buttonFixDef.restitution = material.restitution;
      buttonFixDef.shape = new b2.PolygonShape();
      buttonFixDef.shape.SetAsOrientedBox(worldWidth*0.18, worldHeight*0.3, new b2.Vec2(worldWidth*0.32, worldHeight*0.13), 0);
      
      body.CreateFixture( buttonFixDef );
    }

    buildPipeFixture_(body, material, worldHeight, worldWidth) {
      const leftFixDef = new b2.FixtureDef();
      leftFixDef.density = material.globeDensity;
      leftFixDef.friction = material.friction;
      leftFixDef.restitution = material.restitution;
      leftFixDef.shape = b2.PolygonShape.AsEdge(new b2.Vec2(-worldWidth*0.48, -worldHeight), new b2.Vec2(-worldWidth*0.48, worldHeight*0.5));

      const rightFixDef = new b2.FixtureDef();
      rightFixDef.density = material.globeDensity;
      rightFixDef.friction = material.friction;
      rightFixDef.restitution = material.restitution;
      rightFixDef.shape = b2.PolygonShape.AsEdge(new b2.Vec2(-worldWidth*0, -worldHeight), new b2.Vec2(-worldWidth*0, worldHeight*0.5));
      
      body.CreateFixture( leftFixDef );
      body.CreateFixture( rightFixDef );
    }


    /**
     * @inheritDoc
     */
    buildBody_() {
      const bodyDef = new b2.BodyDef();
      bodyDef.type = b2.BodyDef.b2_staticBody;
      bodyDef.position.Set(this.initialWorldPos_.x, this.initialWorldPos_.y);

      // create the target fixture definition
      const material = this.config_.material;
      const worldWidth = Unit.toWorld(this.config_.style.width);
      const worldHeight = Unit.toWorld(this.config_.style.height);

      const body = this.world_.CreateBody( bodyDef );
      this.buildButtonFixture_(body, material, worldHeight, worldWidth)
      this.buildPipeFixture_(body, material, worldHeight, worldWidth)
      return body;
    }

    /**
     * Destroy dropper
     * @public
     */
    destroy() {
      super.destroy();
      this.removeEventListeners_();
    }
  }


  app.world.Dropper = Dropper;

});