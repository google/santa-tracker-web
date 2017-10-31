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

goog.provide('app.Tools');
goog.require('app.Crayon');
goog.require('app.Eraser');
goog.require('app.LayerTool');
goog.require('app.Marker');
goog.require('app.Pen');
goog.require('app.Slider');
goog.require('app.SprinkleSpray');
goog.require('app.Stamp');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * The toolbox
 * @param {!app.Game} game
 * @param {!jQuery} $elem
 * @constructor
 */
app.Tools = function(game, $elem) {
  this.game_ = game;

  this.sliders = $('[data-slider]', $elem);

  this.primaryMenu = $elem.find('.Tools--primary');
  this.categoryPickers = this.primaryMenu.find('[data-tool-category-picker]');

  this.secondaryMenu = $elem.find('.Tools--secondary');
  this.categoryMenus = this.secondaryMenu.find('[data-tool-category-menu]');
  this.categoryMenuNavs = this.categoryMenus.find('[data-tool-category-nav]');
  this.categoryMenuNavBtns = this.categoryMenuNavs.find('[data-tool-nav]');

  this.tertiaryMenu = $elem.find('.Tools--tertiary');

  this.categoryPickers.on('click.clausedraws touchend.clausedraws', this.onCategoryClick_.bind(this));
  this.categoryMenuNavBtns.on('click.clausedraws touchend.clausedraws', this.onNavClick_.bind(this));

  this.pen = new app.Pen($elem, 'pen');
  this.crayon = new app.Crayon($elem, 'crayon');
  this.marker = new app.Marker($elem, 'marker');
  this.sprinkles = new app.SprinkleSpray($elem, 'spray-sprinkles');
  this.snowbg = new app.LayerTool($elem, 'scene-snowbg', app.LayerTool.Layer.BACKGROUND, $elem.find('#snowbg')[0]);
  this.snowfg = new app.LayerTool($elem, 'scene-snowfg', app.LayerTool.Layer.FOREGROUND, $elem.find('#snowfg')[0]);
  this.eraser = new app.Eraser($elem, 'eraser');
  this.stampSnowman = new app.Stamp($elem, 'snowman', $elem.find('#snowman')[0]);
  this.stampBauble = new app.Stamp($elem, 'bauble', $elem.find('#bauble')[0]);
  this.stampBow = new app.Stamp($elem, 'bow', $elem.find('#bow')[0]);
  this.stampHolly = new app.Stamp($elem, 'holly', $elem.find('#holly')[0]);

  this.tools = [
    this.pen,
    this.crayon,
    this.marker,
    this.sprinkles,
    this.snowbg,
    this.snowfg,
    this.eraser,
    this.stampSnowman,
    this.stampBauble,
    this.stampBow,
    this.stampHolly
  ];
};


/**
 * Starts the tools
 */
app.Tools.prototype.start = function() {
  this.selectTool_ = this.selectTool_.bind(this);
  this.secondaryMenu.on('click.clausedraws touchend.clausedraws',
      this.selectTool_);

  this.onResize();
  $(window).on('resize.clausedraws', this.onResize.bind(this));
};


/**
 * Mouse changed handler
 * @param {!app.Mouse} mouse
 * @param {app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tools.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (this.selectedTool) {
    this.selectedTool.move(mouseCoords);

    if (mouseCoords.down) {
      this.selectedTool.startMousedown();

      if (this.game_.mouse.isInsideEl(mouseCoords.x, mouseCoords.y, this.game_.canvas.displayCanvas)) {
        this.secondaryMenu.removeClass('is-active');
      }
    } else {
      this.selectedTool.stopMousedown();
      this.secondaryMenu.addClass('is-active');
    }
  }
};


/**
 * Handle clicks on the toolbox to select a tool
 * @param {!Event} e DOM click event
 * @private
 */
app.Tools.prototype.selectTool_ = function(e) {
  // Check if on slider
  if ($(e.target).closest('[data-slider]').length) {
    console.log('on slider');
    return;
  }

  var previousTool = this.selectedTool;

  if (previousTool) {
    previousTool.deselect();
  }

  this.selectedTool = this.tools.filter(function(tool) {
    if (tool.el[0] === e.target && !tool.isSelected) {
      return tool;
    }
  })[0];

  if (this.selectedTool) {
    if (app.LayerTool.prototype.isPrototypeOf(this.selectedTool)) {
      this.selectedTool.draw();
      this.selectedTool = null;
    } else {
      var coords = this.game_.mouse.coordinates();
      this.selectedTool.select(coords);
      this.sliderChanged(this.game_.slider.size);
    }
  }
};


app.Tools.prototype.onCategoryClick_ = function(e) {
  var categoryPicker = $(e.target).closest('[data-tool-category-picker]');
  var categoryName = categoryPicker.attr('data-tool-category');
  var categoryMenu = this.secondaryMenu.find('[data-tool-category="' + categoryName + '"]');

  if (!this.currentCategory) {
    this.secondaryMenu.addClass('is-active');
  }

  if (this.currentCategory && this.currentCategory == categoryName) {
    return;
  }

  this.categoryPickers.removeClass('is-active');
  this.categoryMenus.removeClass('is-active');
  categoryMenu.addClass('is-active');
  categoryPicker.addClass('is-active');
  this.currentCategory = categoryName;

  if (this.selectedTool) {
    this.selectedTool.deselect();
    this.selectedTool = null;
  }
};

app.Tools.prototype.sliderChanged = function(size) {
  if (this.selectedTool) {
    this.selectedTool.updateSize(size);
    this.circleSize = this.selectedTool.currentSize *
        this.game_.canvas.canvasRatio;

    this.selectedTool.circleEl.css({
      height: this.circleSize,
      width: this.circleSize
    });

    this.selectedTool.mouseOffset = {
      x: -this.circleSize / 2,
      y: this.circleSize / 2
    };
  }
};


app.Tools.prototype.onNavClick_ = function(e) {
  var menu = $(e.target).closest('[data-tool-category-menu]');
  var direction = $(e.target).attr('data-tool-nav') === 'next' ? 1 : -1;
  var offset = direction * 130; // width of 1 tool

  menu.animate({
    scrollLeft: menu.scrollLeft() + offset
  }, 300);
};


app.Tools.prototype.onResize = function() {
  var outerWidth = this.secondaryMenu[0].getBoundingClientRect().width;

  this.categoryMenuNavs.each(function() {
    var menu = $(this).closest('[data-tool-category-menu]');
    if (menu[0] && menu[0].scrollWidth > outerWidth) {
      $(this).addClass('is-active');
    } else {
      $(this).removeClass('is-active');
    }
  });
};
