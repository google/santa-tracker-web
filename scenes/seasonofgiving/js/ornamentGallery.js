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
  this.ornamentTitles = this.context.find('.ornament-item-name');

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
  var handler = this.handleSelectItem.bind(this);
  this.items.each(function() {
    $(this).on('touchstart click', handler);
  });

  $(window).on('resize.seasonofgiving', this.handleResize.bind(this));
  this.handleResize();
//  window.setTimeout(this.transitionIn.bind(this), 1000);
};

/**
 * Handle window resize.
 */
app.OrnamentGallery.prototype.handleResize = function() {
  this.ornamentTitles.css({
    top: this.context.find('.ornament-item').outerHeight() - 6
  });
};

/**
 * Item selection handler
 * @param {!Event} event Event for select handler
 */
app.OrnamentGallery.prototype.handleSelectItem = function(event) {
  if (!this.isVisible) { return; }  // don't allow clicks during transition

  // TODO(samthor): Should instead use data-... args
  var match = event.currentTarget.className.match(/\bornament-item--(\S+)\b/);
  if (!match) { return; }
  var name = match[1];

  // show ornament
  var ornament = this.context.find('.scene-ornament-wrapper')
    .find('.scene-ornament--' + name)
    .parent();

  // show info button
  this.buttonInfo.addClass('active');

  // hide gallery
  this.hide();

  if (app.GameManager.lastOrnamentObj) {
    app.GameManager.lastOrnamentObj.hide();
  }

  app.GameManager.lastOrnament = ornament;
  app.GameManager.currentIndex = ornament.index() - 1;
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
    this.transitionOut();
    this.context.find('.nav-ornament').addClass('nav-ornament--active');
  }
  this.isVisible = false;
  this.el.removeClass('active');
};

/**
 * Show gallery
 */
app.OrnamentGallery.prototype.show = function() {
  if (!this.isVisible) {
    this.transitionIn();
    this.context.find('.nav-ornament').removeClass('nav-ornament--active');
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
