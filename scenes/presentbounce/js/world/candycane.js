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

goog.provide('app.world.CandyCane');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.Unit');
goog.require('app.world.LevelObject');
  

goog.scope(function () {
  const Constants = app.Constants;
  const Unit = app.Unit;


  /**
   * CandyCane class
   * Fixed object - either straigt or L-shaped
   */
  class CandyCane extends app.world.LevelObject {  
    
    /**
     * @override
     */
    constructor(...args) {
      super(...args); // super(...arguments) doesn't work in Closure Compiler
      this.body_ = this.buildBody_();
    }

    /**
     * @private
     */
    addOuterRadiusVertices_(vertices, x, y, radius) {
      const angleSteps = 90 / (Constants.CORNER_RESOLUTION-1);
      const xOffset = x - radius;
      const yOffset = y + radius;
      for (let i = Constants.CORNER_RESOLUTION-1; i >= 0; i--) { 
        const p = this.pointOnCircle_(radius, angleSteps*i*-1, {x: xOffset, y: yOffset});
        vertices.push( new b2.Vec2( Unit.toWorld(p.x), Unit.toWorld(p.y)) );
      }
    }
    
    /**
     * @private
     */
    addInnerRadiusVertices_(vertices, x, y, radius, stroke) {
      const angleSteps = 90 / (Constants.CORNER_RESOLUTION-1);
      const xOffset = x - radius - stroke/2;
      const yOffset = y + radius + stroke/2;
      for (let i = 0; i < Constants.CORNER_RESOLUTION; i++) { 
        const p = this.pointOnCircle_(radius - stroke/2, angleSteps*i*-1, {x: xOffset, y: yOffset});
        vertices.push( new b2.Vec2( Unit.toWorld(p.x), Unit.toWorld(p.y)) );
      }
    }
    
    
    /**
     * Add and return all vertices of the shape as an array
     * vectors must be added in clockwise order in Box2D coordinates
     * @private
     */
    buildVertices_() {
      const vertices = [];
      const width = this.config_.style.width;
      const height = this.config_.style.height;
      const stroke = this.config_.style.stroke;
      const hasAngle = this.config_.style.hasAngle;
     
      if (hasAngle) {
        // start half
        vertices.push( new b2.Vec2(Unit.toWorld(-width/2), Unit.toWorld(-height/2 + stroke)) );
        vertices.push( new b2.Vec2(Unit.toWorld(-width/2), Unit.toWorld(-height/2)) );
        
        // outer radius
        const outerRadius = stroke*3;
        this.addOuterRadiusVertices_(vertices, width/2, -height/2, outerRadius);

        // end half
        vertices.push( new b2.Vec2(Unit.toWorld(width/2), Unit.toWorld(height/2)) );
        vertices.push( new b2.Vec2(Unit.toWorld(width/2 - stroke), Unit.toWorld(height/2)) );

        // inner radius
        const innerRadius = stroke*2.5;
        this.addInnerRadiusVertices_(vertices, width/2, -height/2, innerRadius, stroke);
      }
      else {
        // start half
        vertices.push( new b2.Vec2(Unit.toWorld(-width/2), Unit.toWorld(height/2)) );
        vertices.push( new b2.Vec2(Unit.toWorld(-width/2), Unit.toWorld(-height/2)) );
        // end halfstyle.
        vertices.push( new b2.Vec2(Unit.toWorld(width/2), Unit.toWorld(-height/2)) );
        vertices.push( new b2.Vec2(Unit.toWorld(width/2), Unit.toWorld(height/2)) );
      }
      
      return vertices;
    }
    
    /**
     * @private 
     */
    buildBody_() {
      const vertices = this.buildVertices_();

      const bodyDef = new b2.BodyDef();
      bodyDef.type = b2.BodyDef.b2_staticBody;
      bodyDef.position.Set(this.initialWorldPos_.x, this.initialWorldPos_.y);
      bodyDef.angle = this.config_.rotation * Math.PI / 180;

      const body = this.world_.CreateBody(bodyDef);
      // SetAsARRAY can only create convex polygons... 
      // fixDef.shape.SetAsArray(vertices, steps);
      // INSTEAD: create Edges from vertices instead of Chain since it doesnt exit
      const numVertices = vertices.length;
      for (let i = 0; i < numVertices; i++) {
        const fixDef = new b2.FixtureDef();
        fixDef.density = this.config_.material.density;
        fixDef.friction = this.config_.material.friction;
        fixDef.restitution = this.config_.material.restitution;
        fixDef.shape = b2.PolygonShape.AsEdge(vertices[i], vertices[(i+1)%numVertices]);
        body.CreateFixture(fixDef);
      }
      return body;
    }
    
    /**
     * @private
     */
    pointOnCircle_(radius, angleInDegrees, origin) {
      // Convert from degrees to radians via multiplication by PI/180
      const angle = angleInDegrees * Math.PI / 180;
      const x = radius * Math.cos(angle) + origin.x;
      const y = radius * Math.sin(angle) + origin.y;
      return {x, y};
    }
  }


  app.world.CandyCane = CandyCane;

});