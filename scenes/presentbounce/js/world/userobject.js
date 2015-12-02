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
      this.$rotateHandle = this.$el_.find('.js-rotate-handle');

      this.isInteractive_ = false;
      this.isActiveInTheScene_ = false;
      this.wasDragged = false;
      this.wasRotated = false;

      this.mouseJoint_ = null;
      this.startAngle_ = null;
      this.moveAngle_ = null;

      this.onDragStart_ = this.onDragStart_.bind(this);
      this.onDragMove_ = this.onDragMove_.bind(this);
      this.onDragEnd_ = this.onDragEnd_.bind(this);
      this.onRotateHandleStart_ = this.onRotateHandleStart_.bind(this);
      this.onRotateHandleMove_ = this.onRotateHandleMove_.bind(this);
      this.onRotateHandleEnd_ = this.onRotateHandleEnd_.bind(this);

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
     * @protected
     */
    onRotateEnd() {
      // override in subclass
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
     * @protected
     */
    getMouseWorldVector(mouseX, mouseY) {
      const viewport = this.level_.getViewport();
      const windowWidth = viewport.windowWidth;
      const windowHeight = viewport.windowHeight;
      const scale = viewport.scale;

      const offsetX = viewport.sceneOffset.left + (windowWidth - Constants.CANVAS_WIDTH*scale) / 2;
      const offsetY = viewport.sceneOffset.top + (windowHeight - Constants.CANVAS_HEIGHT*scale) / 2;

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
     * Calculate angle between mouse and body center
     * @private
     */
    getHandleRadianAngle_(e) {
      e = app.InputEvent.normalize(e);
      const p1 = this.getMouseWorldVector(e.clientX, e.clientY);
      const p2 = this.body_.GetPosition();
      return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

     /**
     * @inheritDoc
     */
    update() {
      // rotate using forces so we collide with other objects
      if (this.isInteractive_) {

        // magic taken from http://www.iforce2d.net/b2dtut/rotate-to-angle
        const deltaAngle = this.startAngle_ - this.moveAngle_;
        const desiredAngle = this.bodyStartAngle_ - deltaAngle;

        const bodyAngle = this.body_.GetAngle();
        const nextAngle = bodyAngle + this.body_.GetAngularVelocity() / 60.0;

        let totalRotation = desiredAngle - nextAngle;

        const DEGTORAD = Math.PI / 180;
        while ( totalRotation < -180 * DEGTORAD ) totalRotation += 360 * DEGTORAD;
        while ( totalRotation >  180 * DEGTORAD ) totalRotation -= 360 * DEGTORAD;
        const desiredAngularVelocity = totalRotation * 60;
        const torque = this.body_.GetInertia() * desiredAngularVelocity / (1/60.0);

        this.body_.ApplyTorque( torque );

        // reset motion in case it collides somewhere
        this.body_.SetLinearVelocity(new b2.Vec2(0, 0))
      }
    }

    /**
     * Applies current user rotation to body
     * @private
     */
    setRotation_() {
      if (this.startAngle_ === null) {
        this.startAngle_ = this.moveAngle_;
        this.wasRotated = true;
      }
      else {
        // Rotation happens in update() using forces so we collide with other objects
      }
    }


    /**
     * Creates a MouseJoint which moves the object to the mouse pointer
     * @private
     */
    createMouseJoint_(e) {
      // hack to prevent tunneling - breaks any contacts and wakes the other bodies
      const x = this.body_.GetPosition().x;
      const y = this.body_.GetPosition().y;
      this.body_.SetPosition( new b2.Vec2(0, 0));
      this.body_.SetPosition( new b2.Vec2(x, y));

      // don't allow rotation while dragging
      this.body_.SetFixedRotation(false);

      // create mouse joint
      const def = new b2.MouseJointDef();
      def.bodyA = this.ground_;
      def.bodyB = this.body_;
      def.target = this.getMouseWorldVector(e.clientX, e.clientY)

      def.collideConnected = false; // no need to collide with fake ground object
      def.maxForce = 10000 * this.body_.GetMass();
      def.dampingRatio = 0.5;
      def.frequencyHz = 5;

      this.mouseJoint_ = this.world_.CreateJoint(def);
    }

    /**
     * isActiveInTheScene
     * @return {Boolean} [description]
     */
    isActiveInTheScene() {
      return this.isActiveInTheScene_;
    }

    /**
     * Shared logic to set object in interactive mode
     * (i.e user is interacting with this object)
     * @private
     */
    enterInteractiveMode_() {
      this.isInteractive_ = true;
      this.startAngle_ = null;
      this.moveAngle_ = null;
      this.bodyStartAngle_ = this.body_.GetAngle();

      // notify all other objects that user is interacting with an object
      // (e.g. will turn off restitution on all fixtures while dragging)
      this.level_.onUserInteractionStart();

      // change type to dynamic so it can be moved
      this.body_.SetType( b2.BodyDef.b2_dynamicBody );
    }

    /**
     * Shared logic to cancel object interactive mode
     * (i.e user stops interacting with this object)
     * @private
     */
    exitInteractiveMode_() {
      // notify all other objects that user stopped interacting with an object
      this.body_.SetType( b2.BodyDef.b2_staticBody );
      this.level_.onUserInteractionEnd();
      this.isInteractive_ = false;

      // call protected methods based on what happened
      if (this.wasDragged) {
        this.onDragEnd();
      }
      if (this.wasRotated) {
        this.onRotateEnd();
      }
      // trigger tap if nothing else happened
      if (!this.wasDragged && !this.wasRotated) {
        this.onTapEnd();
      }

      this.wasDragged = false
      this.wasRotated = false
    }

    /**
     * Callend when user starts dragging Rotation handle (red icon)
     *  - bind listeners for move/end
     * @private
     */
    onRotateHandleStart_(e) {
      if (this.isActiveInTheScene()) {
        return;
      }

      e.stopPropagation();
      e = app.InputEvent.normalize(e);

      // change type to dynamic so it can be moved
      this.body_.SetType( b2.BodyDef.b2_dynamicBody );

      this.enterInteractiveMode_();

      this.$document.on(app.InputEvent.MOVE, this.onRotateHandleMove_);
      this.$document.on(app.InputEvent.END, this.onRotateHandleEnd_);
    }


    /**
     * Called for each move event of the Rotation handle
     * @private
     */
    onRotateHandleMove_(e) {
      this.moveAngle_ = this.getHandleRadianAngle_(e);
      if (this.moveAngle_ !== null) {
        this.setRotation_();
      }
    }

    /**
     * Called when user releases the Rotation handle
     * @private
     */
    onRotateHandleEnd_(e) {
      this.$document.off(app.InputEvent.MOVE, this.onRotateHandleMove_);
      this.$document.off(app.InputEvent.END, this.onRotateHandleEnd_);
      this.exitInteractiveMode_();
    }


    /**
     * Main handler for user interaction
     *  - creates a mouseJoint for moving the object
     *  - bind listeners for move/end
     * @private
     */
    onDragStart_(e) {
      e = app.InputEvent.normalize(e);
      this.enterInteractiveMode_();

      if (!this.mouseJoint_) {
        this.$document.on(app.InputEvent.MOVE, this.onDragMove_);
        this.$document.on(app.InputEvent.END, this.onDragEnd_);

        // create mouseJoint which will drag the object using physics
        this.createMouseJoint_(e);
      }
    }

    /**
     * Handles draggin move events + touch rotation
     * @private
     */
    onDragMove_(e) {
      this.moveAngle_ = this.getTouchRadianAngle_(e);
      e = app.InputEvent.normalize(e);
      // check if we should rotate
      if (this.moveAngle_ !== null) {
        this.setRotation_();
      }
      // else drag to location
      else {
        if (this.mouseJoint_) {
          this.wasDragged = true;
          this.mouseJoint_.SetTarget( this.getMouseWorldVector(e.clientX, e.clientY) );
        }
      }
    }

    /**
     * @private
     */
    onDragEnd_() {
      this.$document.off(app.InputEvent.MOVE, this.onDragMove_);
      this.$document.off(app.InputEvent.END, this.onDragEnd_);

      this.body_.SetFixedRotation(false);
      this.exitInteractiveMode_();

      if (this.mouseJoint_) {
        this.world_.DestroyJoint(this.mouseJoint_);
        this.mouseJoint_ = null;
      }
    }

    /**
     * @inheritDoc
     */
    onUserInteractionStart() {
      super.onUserInteractionStart();
      if (!this.isInteractive_) {
        // user started interacting with other user object - disable my listeners
        this.removeEventListeners_();
      }
    }

    /**
     * @inheritDoc
     */
    onUserInteractionEnd() {
      super.onUserInteractionEnd();
      if (!this.isInteractive_) {
        // Restore interaction listeners
        this.addEventListeners_();
      }
    }
    /**
     * @private
     */
    addEventListeners_() {
      this.$el_.on(app.InputEvent.START, this.onDragStart_);
      this.$rotateHandle.on(app.InputEvent.START, this.onRotateHandleStart_);
    }

    /**
     * @private
     */
    removeEventListeners_() {
      this.$el_.off(app.InputEvent.START, this.onDragStart_);
      this.$document.off(app.InputEvent.MOVE, this.onDragMove_);
      this.$document.off(app.InputEvent.END, this.onDragEnd_);

      this.$rotateHandle.off(app.InputEvent.START, this.onRotateHandleStart_);
      this.$document.off(app.InputEvent.MOVE, this.onRotateHandleMove_);
      this.$document.off(app.InputEvent.END, this.onRotateHandleEnd_);
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