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

/**
 * Creates a circle wizzy.
 *
 * @param {Element} target
 * @param {string} color
 * @param {number} opacity
 * @extends {google.maps.MVCObject}
 * @constructor
 */
function CircleView(target, color, opacity) {
  this.color_ = color;
  this.opacity_ = opacity;
  this.center_ = null;

  this.el_ = document.createElement('div');
  this.el_.className = CircleView.CLASS_NAME_;

  this.closeTarget_ = document.createElement('div');
  this.closeTarget_.className = CircleView.CLOSE_CLASS_NAME_;

  $(this.el_).insertBefore(target);
  $(this.el_).append(this.closeTarget_);

  $(this.closeTarget_).click(this.triggerClose_.bind(this));

  /**
   * @type {?number}
   * @private
   */
  this.hideTimeout_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.showTimeout_ = null;

  this.hide();
  this.render_();
}

CircleView.prototype.show = function() {
  this.animateIn_();
};

CircleView.prototype.hide = function() {
  this.animateOut_();
};

CircleView.prototype.animateIn_ = function() {
  window.clearTimeout(this.hideTimeout_);

  var el = $(this.el_);
  var close = $(this.closeTarget_);

  el.css({
    borderWidth: 0
  }).show().removeClass(CircleView.CIRCLE_OUT_CLASS_NAME_).
            addClass(CircleView.CIRCLE_IN_CLASS_NAME_);

  this.showTimeout_ = window.setTimeout(function() {
    el.removeClass(CircleView.CIRCLE_IN_CLASS_NAME_);
    close.show();
  }, CircleView.ANIMATION_DURATION_ + 1);

  window.setTimeout(this.render_.bind(this), 1);
  window.setTimeout(this.triggerOpen_(this), CircleView.ANIMATION_DURATION_);
  $(window).on('resize.circle', this.render_.bind(this));
};

CircleView.prototype.triggerOpen_ = function() {
  google.maps.event.trigger(this, 'open');
};

CircleView.prototype.triggerClose_ = function() {
  google.maps.event.trigger(this, 'close');
  this.hide();
};

CircleView.prototype.animateOut_ = function() {
  window.clearTimeout(this.showTimeout_);

  $(this.closeTarget_).hide();

  var el = $(this.el_);
  el.css({
    borderWidth: 0
  }).removeClass(CircleView.CIRCLE_IN_CLASS_NAME_).
     addClass(CircleView.CIRCLE_OUT_CLASS_NAME_);

  this.hideTimeout_ = window.setTimeout(function() {
    el.hide().removeClass(CircleView.CIRCLE_OUT_CLASS_NAME_);
  }, CircleView.ANIMATION_DURATION_ + 1);

  $(window).off('resize.circle');
};

/**
 * @return {!Element}
 */
CircleView.prototype.getEl = function() {
  return this.el_;
};

/**
 * The radius of the hole.
 *
 * @type {number}
 * @const
 */
CircleView.HOLE_RADIUS = 74;

CircleView.HOLE_RADIUS_MOBILE = 59;


/**
 * DOM class name.
 *
 * @type {string}
 * @private
 * @const
 */
CircleView.CLASS_NAME_ = 'circle';

/**
 * Close class name.
 *
 * @type {string}
 * @private
 * @const
 */
CircleView.CLOSE_CLASS_NAME_ = 'circle-close';

/**
 * DOM class name for close button.
 *
 * @type {string}
 * @private
 */
CircleView.CIRCLE_IN_CLASS_NAME_ = 'circle-in';

/**
 * DOM class name for close button.
 *
 * @type {string}
 * @private
 * @const
 */
CircleView.CIRCLE_OUT_CLASS_NAME_ = 'circle-out';

/**
 * @type {number}
 * @private
 */
CircleView.ANIMATION_DURATION_ = 500;

/**
 * @type {string}
 * @private
 * @const
 */
CircleView.TRANSFORM_CLASS_NAME_ = 'trans';

CircleView.prototype.setCenter = function(center) {
  this.center_ = center;
  this.render_();
};

CircleView.prototype.render_ = function() {
  var center = this.center_;
  if (!center) return;

  var pageWidth = /** @type {number} */($(window).width());
  var pageHeight = /** @type {number} */($(window).height());
  var radius = Math.max(this.distTo_(0, 0),
                        this.distTo_(0, pageHeight),
                        this.distTo_(pageWidth, 0),
                        this.distTo_(pageWidth, pageHeight));

  var holeRadius = $(window).width() < 668 ? CircleView.HOLE_RADIUS_MOBILE : CircleView.HOLE_RADIUS;

  $(this.el_).css({
    borderColor: this.color_,
    opacity: this.opacity_,
    borderWidth: radius - holeRadius,
    width: radius * 2,
    height: radius * 2,
    left: center.x - radius,
    top: center.y - radius
  });
};

/**
 * Cartesian distance to a given point on the screen.
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
CircleView.prototype.distTo_ = function(x, y) {
  return Math.sqrt(
      Math.pow(this.center_.x - x, 2) +
      Math.pow(this.center_.y - y, 2))
};
