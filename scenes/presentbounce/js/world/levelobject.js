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

goog.provide('app.world.LevelObject');

goog.require('b2');
goog.require('app.Constants');
goog.require('app.Unit');
  

goog.scope(function () {
  const Constants = app.Constants;
  const Unit = app.Unit;


  /**
   * Abtract Base Class - LevelObject class
   * Creats both a Box2D body and renders it as a DOM element.
   */
  class LevelObject {

    /**
     * @param {!app.Level} level The level this object belongs to
     * @param {!b2.World} world The Box2D world instance
     * @param {!Object} levelData Object configuration
     */
    constructor(level, world, config) {
      this.level_ = level;
      this.world_ = world;
      this.config_ = config;

      this.hasRendered_ = false;
      this.initialWorldPos_ = Unit.relativeWorld(this.config_.relX, this.config_.relY);
      
      // Create DOM elements
      this.shadowEl_ = this.createShadowDOMNode_();
      this.el_ = this.createTextureDOMNode_();

      // Box2d body - implemented by subclass
      this.body_ = null;
    }

    /**
     * @protected
     */
    registerForCollisions(callback) {
      // TODO set callback on Box2D body user data
      //this.body_.UserData.callback = callback;
    }

    /**
     * @private
     */
    createTextureDOMNode_() {
      const el = document.createElement("div");
      el.className = 'object ' + this.config_.style.className;
      el.innerHTML = this.config_.style.innerHTML || '';
      this.setElementStyle_(el);
      $(this.level_.elem).append(el);
      return el;
    }

    /**
     * @private
     */
    createShadowDOMNode_() {
      if (this.config_.style.dynamicShadow) {
        const shadowEl = document.createElement("div");
        shadowEl.className = 'object object--shadow ' + this.config_.style.className;
        this.setElementStyle_(shadowEl);
        $(this.level_.elem).append(shadowEl);
        return shadowEl;
      }
    }

    /**
     * @private
     */
    setElementStyle_(el) {
      let width = this.config_.style.width;
      let height = this.config_.style.height
      const padding = this.config_.style.padding;

      // DOM element can have optional padding around Box2d body
      width = padding ? width + padding*2 : width;
      height = padding ? height + padding*2 : height;
      
      // Set to Box2D body dimension and offset center of gravity
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      el.style.marginTop = (height * -0.5) + 'px';
      el.style.marginLeft = (width * -0.5) + 'px';
    }

    /**
     * @private
     */
    transformEl_(el, x, y, angle) {
      el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + angle + 'rad)';
    }

    /**
     * @public
     */
    update() {
      // override to add custom forces before World step
    }

    /**
     * @public
     */
    position() {
      let x, y;
      if (this.body_) {
        const p = this.body_.GetPosition();
        x = Unit.fromWorld(p.x);
        y = Unit.fromWorld(p.y);
      }
      return {x, y};
    }

    /**
     * @public
     */
    draw() {
      if (!this.body_) {
        return;
      }

      if (!this.hasRendered_ || this.body_.IsAwake()) {
        // draw in DOM using transform
        var pos = this.body_.GetPosition();
        var angle = this.body_.GetAngle();
        
        const x = Unit.fromWorld(pos.x),
              y = Unit.fromWorld(pos.y),
              a = angle.toFixed(6);
        
        this.transformEl_(this.el_, x, y, a);
        if (this.shadowEl_) {
          this.transformEl_(this.shadowEl_, x + Constants.SHADOW_OFFSET_PX, y + Constants.SHADOW_OFFSET_PX, a);
        }
        
        this.hasRendered_ = true;
      }
    }


    /**
     * @public
     */
    setRestitution_(restitution) {
      if (this.body_) {
        let node = this.body_.GetFixtureList().GetFirstNode();
        while (node) {
          node.fixture.SetRestitution(restitution);
          node = node.GetNextNode();
        }
      }
    }

    /**
     * @public
     */
    disableRestitution() {
      this.setRestitution_(0);
    }

    /**
     * @public
     */
    enableRestitution() {
      this.setRestitution_(this.config_.material.restitution); 
    }

    /**
     * @public
     */
    destroy() {
      if (this.world_ && this.body_) {
        this.world_.DestroyBody(this.body_);
      }
      $(this.el_).remove();
      $(this.shadowEl_).remove();
    }
  }


  app.world.LevelObject = LevelObject;

});
