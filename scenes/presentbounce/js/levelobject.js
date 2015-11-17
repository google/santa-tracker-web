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

goog.provide('app.LevelObject');

goog.require('b2');
goog.require('app.Unit');
  
/**
 * Abtract Base Class - LevelObject class
 * Creats both a Box2D body and renders it as a DOM element.
 */
class LevelObject {

  /**
   * @constructor
   * @param {!app.Level} level The level this object belongs to
   * @param {!b2.World} world The Box2D world instance
   * @param {!Object} levelData Object configuration
   */
  constructor(level, world, config) {
    this.level_ = level;
    this.world_ = world;
    this.config_ = config;

    this.hasRendered_ = false;
    this.initialWorldPos_ = app.Unit.relativeWorld(this.config_.relX, this.config_.relY);
    
    // Create DOM elements
    this.shadowEl_ = this.createShadowDOMNode_();
    this.el_ = this.createTextureDOMNode_();

    // Box2d body
    this.body_ = this.buildBody();
  }

  /**
   * @protected
   */
  buildBody() {
    throw "must override in subclass";
  }

  /**
   * @private
   */
  createTextureDOMNode_() {
    const el = document.createElement("div");
    el.className = 'object ' + this.config_.style.className;
    el.innerHTML = this.config_.style.innerHTML || '';
    this.setElementStyle_(el);
    document.documentElement.appendChild(el);
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
      document.documentElement.appendChild(shadowEl);
      return shadowEl;
    }
  }

  /**
   * @private
   */
  setElementStyle_(el) {
    let {width, height, padding} = this.config_.style;
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
  draw() {
    if (!this.hasRendered_ || this.body_.IsAwake()) {
      // draw in DOM using transform
      var pos = this.body_.GetPosition();
      var angle = this.body_.GetAngle();
      
      const x = app.Unit.fromWorld(pos.x),
            y = app.Unit.fromWorld(pos.y),
            a = angle.toFixed(6);
      
      this.transformEl_(this.el_, x, y, a);
      if (this.shadowEl_) {
        this.transformEl_(this.shadowEl_, x + SHADOW_OFFSET_PX, y + SHADOW_OFFSET_PX, a);
      }
      
      this.hasRendered_ = true;
    }
    else {
      // debug show sleeping
      this.el_.style.outlineColor = 'grey';
    }
  }

  /**
   * @public
   */
  destroy() {
    if (this.world_) {
      this.world_.DestroyBody(this.body_);
    }
    document.documentElement.removeChild(this.el_);
    if (this.shadowEl_) {
      document.documentElement.removeChild(this.shadowEl_);
    }
  }
}

app.LevelObject = LevelObject;
