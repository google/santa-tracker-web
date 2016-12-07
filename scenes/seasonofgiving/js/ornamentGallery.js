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

goog.require('app.GameManager');

goog.provide('app.OrnamentGallery');

/**
 * Ornament Gallery selection menu
 * @constructor
 * @param {!Element|jQuery|string} el Base for gallery
 * @param {!Element|jQuery} context The DOM element which wraps the game
 */
app.OrnamentGallery = function(el, context) {
  this.isVisible = false;

  this.el = $(el).find('.ornament-gallery');
  this.context = $(context);
  this.items = this.context.find('.ornament-item');
  this.buttonInfo = this.context.find('.Button-info');

  this.scrollOffset = 0;
  this.touchStart = {x: 0, y: 0};
  this.mousePosition = {x: 0, y: 0};
  this.currentOrnament = null;

  this.crayon = this.context.find('.ornament-gallery-crayon');
  this.crayonHeight = $(this.crayon).height();
  this.crayonOffset = {x: 12, y: 22};

  this.bounceIn = [
    {transform: this.animScale(.3, 1), opacity: '0'},
    {transform: this.animScale(1.2, 1), opacity: '.5'},
    {transform: this.animScale(.9, 1), opacity: '1'},
    {transform: this.animScale(1.03, 1), opacity: '1'},
    {transform: this.animScale(.97, 1), opacity: '1'},
    {transform: this.animScale(1, 1), opacity: '1'}
  ];

  // nb. hold visibility until animation is done
  this.bounceOut = [
    {transform: this.animScale(1, 1), opacity: '1', visibility: 'visible'},
    {transform: this.animScale(1.13, 1), opacity: '1', visibility: 'visible'},
    {transform: this.animScale(.3, 1), opacity: '0', visibility: 'visible'},
    {transform: this.animScale(.3, 1), opacity: '0', visibility: 'hidden'}
  ];

  app.GameManager.gallery = this;
};

/**
 * Initialize Ornament Gallery.
 */
app.OrnamentGallery.prototype.init = function() {
  var clickHandler = this.handleSelectItem.bind(this);
  var touchstartHandler = this.onTouchstart.bind(this);
  var touchendHandler = this.onTouchend.bind(this);
  var mouseoverHandler = this.onMouseover.bind(this);

  this.items.each(function() {
    $(this).on({
      click: clickHandler,
      touchstart: touchstartHandler,
      touchend: touchendHandler,
      mouseover: mouseoverHandler
    });
  });

  this.items.on({
    mousemove: this.onMousemove.bind(this),
    mouseout: this.onMouseout.bind(this)
  });
};

/**
 * Save touch start position (to check swipe/tap) and current ornament, show hover image
 * @param {jQuery.Event} event The event object
 */
app.OrnamentGallery.prototype.onTouchstart = function(event) {
  var touch = event.originalEvent.changedTouches[0];
  this.touchStart.x = touch.pageX;
  this.touchStart.y = touch.pageY;

  this.currentOrnament = $(event.target).closest('.ornament-item-container');
  this.showHoverImage();
};

/**
 * Trigger item selection if the touch was a tap, hide hover image
 * @param {jQuery.Event} event The event object
 */
app.OrnamentGallery.prototype.onTouchend = function(event) {
  var touch = event.originalEvent.changedTouches[0];

  if (this.touchStart.x == touch.pageX &&
      this.touchStart.y == touch.pageY) {
    this.handleSelectItem(event);
  }

  this.hideHoverImage();
};

/**
 * Save scroll offset for crayon position, show hover image
 * @param {Event} event The event object
 */
app.OrnamentGallery.prototype.onMouseover = function(event) {
  this.scrollOffset = /** @type {number} */ ($('.scene').scrollTop());

  this.currentOrnament = $(event.target).closest('.ornament-item-container');
  this.showHoverImage();
};

/**
 * Get current mouse position for crayon position
 * @param {Event} event The event object
 */
app.OrnamentGallery.prototype.onMousemove = function(event) {
  this.mousePosition.x = event.pageX;
  this.mousePosition.y = event.pageY;
  this.moveCrayon();
};

/**
 * Remove hover elements on mouseout
 */
app.OrnamentGallery.prototype.onMouseout = function() {
  this.hideCrayon();
  this.hideHoverImage();
};

/**
 * Item selection handler
 * @param {!jQuery.Event} event Event for select handler
 */
app.OrnamentGallery.prototype.handleSelectItem = function(event) {
  if (!this.isVisible) { return; }  // don't allow clicks during transition

  // TODO(samthor): Should instead use data-... args
  var match = $(event.currentTarget).data('org');
  if (!match) { return; }
  var name = match;

  // show ornament
  var ornament = this.context.find('.scene-ornament-wrapper')
    .find('.scene-ornament' + '[data-org="' + name + '"]')
    .parent();

  // show info button
  this.buttonInfo.addClass('active');

  // hide gallery
  this.hide();

  if (app.GameManager.lastOrnamentObj) {
    app.GameManager.lastOrnamentObj.hide();
  }

  app.GameManager.lastOrnament = ornament;
  app.GameManager.currentIndex = ornament.index() - 2;
  app.GameManager.ornaments[app.GameManager.currentIndex].show(500);
  app.GameManager.lastOrnamentObj = app.GameManager.ornaments[app.GameManager.currentIndex];
  app.GameManager.currentCanvas = this.context.find('#canvas--' + name)[0];
  window.santaApp.fire('sound-trigger', 'spirit_click');
};

/**
 * Hide gallery
 */
app.OrnamentGallery.prototype.hide = function() {
  if (this.isVisible) {
    this.scrollOffset = /** @type {number} */ (this.context.find('.scene').scrollTop());

    this.transitionOut();
    this.context.find('.nav-ornament').addClass('nav-ornament--active');

    this.context.find('.scene-intro, .scene-gallery, .scene-footer, .Tool-panel').toggle();
  }
  this.isVisible = false;
  this.el.removeClass('active');
};

/**
 * Show gallery
 */
app.OrnamentGallery.prototype.show = function() {
  if (!this.isVisible) {
    this.context.find('.Tool-panel').hide();
    this.context.find('.scene-intro, .scene-gallery, .scene-footer').show();

    this.transitionIn();
    this.context.find('.nav-ornament').removeClass('nav-ornament--active');

    this.context.find('.scene').scrollTop(this.scrollOffset);
  }
  this.isVisible = true;
  this.el.addClass('active');
};

/**
 * Transition in selection menu
 */
app.OrnamentGallery.prototype.transitionIn = function() {
  var animations = [];

  for (var i = 0; i < this.items.length; i++) {
    var timing = {
      fill: 'backwards', // hold opacity until delay starts
      delay: 65 * i,
      duration: 600,
      ease: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
    };
    animations.push(new KeyframeEffect(this.items[i], this.bounceIn, timing));
  }

  document.timeline.play(new GroupEffect(animations));
};

/**
 * Transition Out selection menu
 */
app.OrnamentGallery.prototype.transitionOut = function() {
  var animations = [];

  for (var i = this.items.length - 1; i >= 0; i--) {
    var timing = {
      fill: 'backwards', // hold visibility until delay starts
      delay: 40 * i,
      duration: 450,
      ease: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
    };
    animations.push(new KeyframeEffect(this.items[i], this.bounceOut, timing));
  }

  document.timeline.play(new GroupEffect(animations));
};

/**
 * Scale prop
 * @param {number} to start num
 * @param {number} end finish num
 * @return {string} returns string for scale animation
 */
app.OrnamentGallery.prototype.animScale = function(to, end) {
  return 'scale3d(' + (to * end) + ',' + (to * end) + ',' + (to * end) + ')';
};

/**
 * Display hover image on ornament
 */
app.OrnamentGallery.prototype.showHoverImage = function() {
  this.currentOrnament.addClass('ornament-item-container--active');
};

/**
 * Remove hover image from ornament
 */
app.OrnamentGallery.prototype.hideHoverImage = function() {
  this.currentOrnament.removeClass('ornament-item-container--active');
};

/**
 * Move crayon with mouse
 */
app.OrnamentGallery.prototype.moveCrayon = function() {
  this.crayon.css({
    left: this.mousePosition.x - this.crayonOffset.x,
    top: this.mousePosition.y - this.crayonHeight - this.crayonOffset.y + this.scrollOffset
  });

  this.crayon.addClass('ornament-gallery-crayon--active');
};

/**
 * Hide crayon
 */
app.OrnamentGallery.prototype.hideCrayon = function() {
  this.crayon.removeClass('ornament-gallery-crayon--active');
};
