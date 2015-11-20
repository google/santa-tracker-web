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

goog.provide('app.world.UserObject');

goog.require('b2');
goog.require('app.InputEvent');
goog.require('app.Constants');
goog.require('app.Unit');
goog.require('app.world.LevelObject');


goog.scope(function () {
  const Constants = app.Constants;
  const Unit = app.Unit;
      
    
  /**
   * Abtract Base Class - UserObject class
   * Add user controls such as drag / rotation to object
   */
  class UserObject extends app.world.LevelObject {
    
    /**
     * @override
     */
    constructor(...args) {
      super(...args); // super(...arguments) doesn't work in Closure Compiler

      this.$document = $(document);
      this.wasDragged = false;
      this.mouseJoint_ = null;

      this.startAngle_ = null;
      this.moveAngle_ = null;
      
      this.onDragStart_ = this.onDragStart_.bind(this);
      this.onDragMove_ = this.onDragMove_.bind(this);
      this.onDragEnd_ = this.onDragEnd_.bind(this);
      
      this.addEventListeners_();
      this.buildReferenceBody_();
    }

    /**
     * @protected
     */
    onTapEnd() {
      // override in subclass
    }

    /**
     * @protected
     */
    onDragEnd() {
      // override in subclass
    }

    /**
     * @private
     */
    addEventListeners_() {
      this.$el_.on(app.InputEvent.START, this.onDragStart_);
    }

    /**
     * @private
     */
    removeEventListeners_() {
      this.$el_.off(app.InputEvent.START, this.onDragStart_);
      this.$document.off(app.InputEvent.END, this.onDragEnd_);
      this.$document.off(app.InputEvent.MOVE, this.onDragMove_);
    }

    /**
     * Hidden ground body used as reference point for MouseJoint
     * @private
     */
    buildReferenceBody_() {
      // POTENTIAL OPTIMIZATION this body could be shared between all user objects
      const bodyDef = new b2.BodyDef();
      bodyDef.type = b2.BodyDef.b2_staticBody;
      bodyDef.position.Set(0, 0); // place outside of canvas
      this.ground_ = this.world_.CreateBody( bodyDef );
    }

    /**
     * Converts current mouse position to position inside Level element.
     *  - Offsets difference between Level container and window width
     *  - Scales x value based on overall scene scale
     * @private
     */
    getMouseVector_(mouseX, mouseY) {

      const viewport = this.level_.getViewport();
      const windowWidth = viewport.windowWidth;
      const windowHeight = viewport.windowHeight;
      const scale = viewport.scale;

      const offsetX = (windowWidth - Constants.CANVAS_WIDTH*scale) / 2;
      const offsetY = (windowHeight - Constants.CANVAS_HEIGHT*scale) / 2;
      
      const x = (mouseX - offsetX) / scale;
      const y = (mouseY - offsetY) / scale;

      return new b2.Vec2(Unit.toWorld(x), Unit.toWorld(y));
    }


    /**
     * Calculate angle of two finger touch
     * @private
     */
    getTouchRadianAngle_(e) {
      e = e.originalEvent ? e.originalEvent : e;
      if (e.touches && e.touches.length > 1) {

        const p1 = {x: e.touches[0].clientX, y: e.touches[0].clientY};
        const p2 = {x: e.touches[1].clientX, y: e.touches[1].clientY};
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
      }
      return null;
    }

    /**
     * @inheritDoc
     */
    onUserInteractionStart() {
      super.onUserInteractionStart();
      if (!this.mouseJoint_) {
        // user started interacting with other user object - disable my listeners
        this.removeEventListeners_();
      }
    }

    /**
     * @inheritDoc
     */
    onUserInteractionEnd() {
      super.onUserInteractionEnd();
      if (!this.mouseJoint_) {
        // Restore interaction listeners
        this.addEventListeners_();
      }
    }


    /**
     * Main handler for user interaction 
     *  - creates a mouseJoint for moving the object
     *  - bind listeners for move/end
     * @private
     */
    onDragStart_(e) {
      e = app.InputEvent.normalize(e);
      this.startAngle_ = null;
      this.moveAngle_ = null;
      this.bodyStartAngle_ = this.body_.GetAngle();

      if (!this.mouseJoint_) {
        this.$document.on(app.InputEvent.END, this.onDragEnd_);
        this.$document.on(app.InputEvent.MOVE, this.onDragMove_);
        
        // change type to dynamic so it can be moved
        this.body_.SetType( b2.BodyDef.b2_dynamicBody );

        // hack to prevent tunneling - breaks any contacts and wakes the other bodies
        const x = this.body_.GetPosition().x;
        const y = this.body_.GetPosition().y;
        this.body_.SetPosition( new b2.Vec2(0, 0));
        this.body_.SetPosition( new b2.Vec2(x, y));

        // don't allow rotation while dragging
        this.body_.SetFixedRotation(true);

        // create mouse joint
        const def = new b2.MouseJointDef();
        def.bodyA = this.ground_;
        def.bodyB = this.body_;
        def.target = this.getMouseVector_(e.clientX, e.clientY)

        def.collideConnected = false; // no need to collide with fake ground object
        def.maxForce = 10000 * this.body_.GetMass();
        def.dampingRatio = 0.5;
        def.frequencyHz = 5;

        this.mouseJoint_ = this.world_.CreateJoint(def);
        
        // notify all other objects that user is interacting with an object
        // (e.g. will turn off restitution on all fixtures while dragging)
        this.level_.onUserInteractionStart();
      }
    }

    /**
     * @private
     */
    onDragMove_(e) {
      this.moveAngle_ = this.getTouchRadianAngle_(e);
      e = app.InputEvent.normalize(e);
      // make sure this object is the one with the mouseJoint
      if (this.mouseJoint_) {
        // check if we should rotate
        if (this.moveAngle_ !== null) {
          if (this.startAngle_ === null) {
            this.startAngle_ = this.moveAngle_;
          }
          else {
            const deltaAngle = this.startAngle_ - this.moveAngle_;
            this.body_.SetAngle( this.bodyStartAngle_ - deltaAngle );
          }
        }
        // drag to location
        this.wasDragged = true;
        this.mouseJoint_.SetTarget( this.getMouseVector_(e.clientX, e.clientY) );
      }
    }

    /**
     * @private
     */
    onDragEnd_() {
      this.$document.off(app.InputEvent.END, this.onDragEnd_);
      this.$document.off(app.InputEvent.MOVE, this.onDragMove_);
      
      this.body_.SetFixedRotation(false);
      this.body_.SetType( b2.BodyDef.b2_staticBody );
      this.level_.onUserInteractionEnd();
      
      if (this.mouseJoint_) {
        this.world_.DestroyJoint(this.mouseJoint_);
        this.mouseJoint_ = null;
      }

      if (this.wasDragged) {
        this.wasDragged = false
        this.onDragEnd();
      }
      else {
        this.onTapEnd();
      }  
    }

    /**
     * public
     */
    destroy() {
      this.removeEventListeners_();
      super.destroy();
    }
  }


  app.world.UserObject = UserObject;

});
