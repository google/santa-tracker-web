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

goog.provide('app.OrnamentNavigation');

/**
 * Ornament Navigation
 * @constructor
 * @param {!Element} elem The DOM element which wraps the game.
 */
app.OrnamentNavigation = function(elem) {
  this.elem = elem;
  this.ornamentNavigation = $('.nav-ornament', this.elem);
  this.ornamentCopyContainer = $('.ornament-copy-container', this.elem);
  this.ornamentCopy = $('.ornament-copy', this.elem);
  this.mobileCopyContainer = $('.copy-container', this.elem);
  this.buttonNext = $('.Button-next-ornament', this.elem);
  this.buttonPrev = $('.Button-prev-ornament', this.elem);
  this.buttonShowAll = $('.Button-show-all', this.elem);
  this.buttonInfo = $('.Button-info', this.elem);
  this.buttonClose = $('.Button-close', this.elem);
  this.ornamentGallery = $('.scene-gallery', this.elem);
  this.ornament = this.ornamentCopy.closest('.ornament', this.elem);
  this.totalOrnaments = app.GameManager.ornaments.length;
  this.lastOrnamentNum = 0;
  this.lastOrnament = null;

  this.selectItemAnimIn = [
    {opacity: '0'},
    {opacity: '1'}
  ];

  this.selectItemAnimOut = [
    {opacity: '1'},
    {opacity: '0'}
  ];

  this.selectItemAnimProps = {
    fill: 'forwards',
    duration: 700,
    ease: 'ease-out'
  };

  this.init();

  app.GameManager.navigation = this;
};

/**
 * Ornament Navigation
 * @constructor
 */
app.OrnamentNavigation.prototype.init = function() {
  this.addEventListeners();
  this.handleResize();
};

/**
 * Add all listeners for ornament navigation
 */
app.OrnamentNavigation.prototype.addEventListeners = function() {
  this.buttonNext.on('touchstart mousedown', this.handleNext.bind(this));
  this.buttonPrev.on('touchstart mousedown', this.handlePrev.bind(this));
  this.buttonShowAll.on('touchstart mousedown', this.handleShowGallery.bind(this));
  this.buttonInfo.on('touchstart mousedown', this.handleShowInfo.bind(this));
  this.buttonClose.on('touchstart mousedown', this.handleHideInfo.bind(this));
  $(window).on('resize.seasonofgiving', this.handleResize.bind(this));
};

/**
 * Show next ornament
 */
app.OrnamentNavigation.prototype.handleNext = function() {
  app.GameManager.bounce(this.buttonNext[0]);

  app.GameManager.currentIndex += 1;
  if (app.GameManager.currentIndex > app.GameManager.ornaments.length - 1) {
    app.GameManager.currentIndex = 0;
  }

  var currentOrnamentNum = app.GameManager.currentIndex;
  var currentOrnament = this.elem.find('.scene-ornament-wrapper').eq(currentOrnamentNum);

  currentOrnament.toggleClass('active');

  if (app.GameManager.lastOrnament) {
    app.GameManager.lastOrnament.removeClass('active');
    app.GameManager.lastOrnamentObj.hide();
  }

  this.elem.find('.Button-info').addClass('active');
  this.ornamentGallery.removeClass('active');
  app.GameManager.lastOrnament = this.elem.find(currentOrnament);
  app.GameManager.ornaments[currentOrnamentNum].show();
  app.GameManager.lastOrnamentObj = app.GameManager.ornaments[currentOrnamentNum];

  app.GameManager.gallery.hide();
  Klang.triggerEvent('spirit_click');
};

/**
 * Show prev ornament
 */
app.OrnamentNavigation.prototype.handlePrev = function() {
  app.GameManager.bounce(this.buttonPrev[0]);

  app.GameManager.currentIndex -= 1;
  if (app.GameManager.currentIndex < 0) {
    app.GameManager.currentIndex = this.totalOrnaments - 1;
  }

  var currentOrnamentNum = app.GameManager.currentIndex;
  var currentOrnament = this.elem.find('.scene-ornament-wrapper').eq(currentOrnamentNum);
  currentOrnament.toggleClass('active');
  if (app.GameManager.lastOrnament) {
    app.GameManager.lastOrnament.removeClass('active');
    app.GameManager.lastOrnamentObj.hide();
  }

  this.elem.find('.Button-info').addClass('active');
  app.GameManager.lastOrnamentObj = app.GameManager.ornaments[currentOrnamentNum];
  app.GameManager.lastOrnament = this.elem.find(currentOrnament);
  this.ornamentGallery.removeClass('active');
  app.GameManager.lastOrnamentObj.show();

  app.GameManager.gallery.hide();
  Klang.triggerEvent('spirit_click');
};

/**
 * Show all ornaments
 */
app.OrnamentNavigation.prototype.handleShowGallery = function() {
  app.GameManager.bounce(this.buttonShowAll[0]);

  if (app.GameManager.lastOrnament) {
    app.GameManager.lastOrnament.removeClass('active');
    this.elem.find('.Button-info').removeClass('active');
    app.GameManager.lastOrnamentObj.hide();
  }

  this.ornamentGallery.addClass('active');
  app.GameManager.lastOrnament.removeClass('active');
  app.GameManager.lastOrnament = null;
  app.GameManager.gallery.show();

  Klang.triggerEvent('spirit_click');
};

/**
 * Handler for window resize
 */
app.OrnamentNavigation.prototype.handleResize = function() {
  var tempCSS;
  var tempElem;
  var topOffset;
  var currentCopy;
  var currentOrnamentNum;
  var currentOrnament;

  if ($(window).width() < 1025) {
    tempElem = this.elem.find('.Tool-crayon--violet')[0];
    topOffset = tempElem.getBoundingClientRect().top - 84;
    tempCSS = {
      'left': '50%',
      'top': topOffset,
      'width': '180px',
      'transform': 'translate(-50%, 0px) scale(0.9)'
    };
    this.ornamentCopyContainer.css('height', $(window).height());
    this.buttonInfo.css('top', topOffset - 5);
  } else {
    currentOrnamentNum = app.GameManager.currentIndex;
    currentOrnament = this.elem.find('.scene-ornament-wrapper').eq(currentOrnamentNum);
    if (this.elem.find('.scene-ornament-wrapper.active .ornament-copy').length > 0) {
      currentCopy = this.elem.find('.scene-ornament-wrapper.active .ornament-copy');
    } else {
      currentCopy = this.elem.find('.scene-ornament-wrapper .ornament-copy');
    }
    tempCSS = {
      'left': currentCopy[0].getBoundingClientRect().left,
      'top': currentCopy[0].getBoundingClientRect().top - 98,
      'transform': 'none',
      'width': '200px'
    };
    this.ornamentCopyContainer.css('height', 'auto');
    this.buttonInfo.css('top', 'auto');
  }
  this.ornamentNavigation.css(tempCSS);
};

/**
 * Show info overlay on mobile.
 */
app.OrnamentNavigation.prototype.handleShowInfo = function() {
  this.elem.find('.scene-container').css('z-index', 4);
  this.elem.find('.Tool-panel').css('z-index', 2);
  this.ornamentCopyContainer.removeClass('hide').addClass('show');
  app.GameManager.bounce(this.buttonInfo[0]);
};

/**
 * Hide info overlay on mobile.
 */
app.OrnamentNavigation.prototype.handleHideInfo = function() {
  app.GameManager.bounce(this.buttonClose[0]);
  this.elem.find('.scene-container').css('z-index', 0);
  this.elem.find('.Tool-panel').css('z-index', 2);
  this.ornamentCopyContainer.removeClass('show').addClass('hide');
};
