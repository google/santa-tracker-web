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


/**
 * Abtract Base Class - LevelObject class
 * Creates both a Box2D body and renders it as a DOM element.
 * @constructor
 */
app.world.LevelObject = class {

  /**
   * @param {!Object} level The level this object belongs to
   * @param {!Object} world The Box2D world instance
   * @param {!Object} levelData Object configuration
   */
  constructor(level, world, config) {
    this.level_ = level;
    this.world_ = world;
    this.config_ = config;

    this.hasRendered_ = false;
    this.collisionFixture = null;
    this.initialWorldPos_ = app.Unit.relativeWorld(this.config_.relX, this.config_.relY);

    // Create DOM elements
    this.shadowEl_ = this.createShadowDOMNode_();
    this.el_ = this.createTextureDOMNode_();
    this.$el_ = $(this.el_);

    // Box2d body - implemented by subclass
    this.body_ = null;
  }

  /**
   * Sets which fixture should be used for collision comparison.
   * @param {Object} obj Fixture to saved
   */
  setCollisionFixture(obj) {
    this.collisionFixture = obj;
  }

  /**
   * @protected
   */
  registerForCollisions(callback) {
    this.body_.collisionCallback = callback;
  }

  /**
   * @protected
   */
  unregisterForCollisions() {
    if (this.body_.collisionCallback) {
      delete this.body_.collisionCallback;
    }
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

    // margin top is -50% of height by default - can be overriden
    let marginTop = height * -0.5;
    if (typeof this.config_.style.marginTop !== 'undefined') {
      marginTop = this.config_.style.marginTop;
    }

    let marginLeft = width * -0.5;
    if (typeof this.config_.style.marginLeft !== 'undefined') {
      marginLeft = this.config_.style.marginLeft;
    }

    // Set to Box2D body dimension and offset center of gravity
    el.style.width = width + 'px';
    el.style.height = height + 'px';

    el.style.marginTop = marginTop + 'px';
    el.style.marginLeft = marginLeft + 'px';
  }

  /**
   * @private
   */
  transformEl_(el, x, y, angle) {
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + angle + 'rad)';
  }

  /**
   * Add custom forces before World step
   * @public
   */
  update() {
    // override to add custom forces before World step
  }

  /**
   * Pause callback passed to instances.
   */
  pause() {
    // override to add custom forces before World step
  }

  /**
   * Resume callback passed to instances.
   */
  resume() {
    // override to add custom forces before World step
  }

  /**
   * @protected
   */
  buildBody_() {
    // override to build the body
  }

  /**
   * @public
   */
  position() {
    let x, y;
    if (this.body_) {
      const p = this.body_.GetPosition();
      x = app.Unit.fromWorld(p.x);
      y = app.Unit.fromWorld(p.y);
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

      const x = app.Unit.fromWorld(pos.x),
            y = app.Unit.fromWorld(pos.y),
            a = angle.toFixed(6);

      this.transformEl_(this.el_, x, y, a);
      if (this.shadowEl_) {
        this.transformEl_(this.shadowEl_, x + app.Constants.SHADOW_OFFSET_PX, y + app.Constants.SHADOW_OFFSET_PX, a);
      }

      this.hasRendered_ = true;
    }
  }


  /**
   * Sets restitution on all fixtures to specified value
   * Stores original value on fixture as user data
   * @private
   */
  setRestitution_(restitution) {
    if (this.body_) {
      let node = this.body_.GetFixtureList().GetFirstNode();
      while (node) {
        if (typeof restitution !== 'undefined') {
          node.fixture.originalRestitution_ = node.fixture.GetRestitution();
          node.fixture.SetRestitution(restitution);
        }
        else if (typeof node.fixture.originalRestitution_ !== 'undefined') {
          node.fixture.SetRestitution(node.fixture.originalRestitution_);
        }
        node = node.GetNextNode();
      }
    }
  }

  /**
   * Resets restitution to original value on all fixtures
   * @private
   */
  resetRestitution_() {
    if (this.body_) {
      let node = this.body_.GetFixtureList().GetFirstNode();
      while (node) {
        if (typeof node.fixture.originalRestitution_ !== 'undefined') {
          node.fixture.SetRestitution(node.fixture.originalRestitution_);
        }
        node = node.GetNextNode();
      }
    }
  }

  /**
   * Called when user is interacting any object in the word
   * @public
   */
  onUserInteractionStart() {
    // disable bouncy surfaces while dragging
    this.setRestitution_(0);
    this.level_.onInteraction();
  }

  /**
   * Called when user stops interacting with the word
   * @public
   */
  onUserInteractionEnd() {
    this.resetRestitution_();
  }

  /**
   * @public
   */
  destroy() {
    if (this.world_ && this.body_) {
      this.world_.DestroyBody(this.body_);
    }
    this.unregisterForCollisions();
    $(this.el_).remove();
    $(this.shadowEl_).remove();
  }
}