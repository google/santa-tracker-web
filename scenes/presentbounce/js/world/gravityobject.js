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

goog.provide('app.world.GravityObject');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.world.LevelObject');


goog.scope(function () {

  /**
   * Abtract Base Class - GravityObject class
   * Creats both a Box2D body and renders it as a DOM element.
   */
  class GravityObject extends app.world.LevelObject {

    /**
     * Add custom gravity force before Box2D World step
     * @override
     */
    update() {
      this.body_.ApplyForce( new b2.Vec2(0, app.Constants.PHYSICS_GRAVITY), this.body_.GetPosition() );
    }
  }


  app.world.GravityObject = GravityObject;
  
});