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

  this.categoryPickers.on('click.clausedraws', this.onCategoryClick_.bind(this));

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
    } else {
      this.selectedTool.stopMousedown();
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
  var x = e.clientX;
  var y = e.clientY;
  if (this.game_.mouse.isInsideEl(x, y, this.sliders[0])) {
    console.log('on slider');
    return;
  }

  var previousTool = this.selectedTool;

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
    }
  }

  if (previousTool) {
    previousTool.deselect();
  }
};


app.Tools.prototype.onCategoryClick_ = function(e) {
  var categoryPicker = $(e.target).closest('[data-tool-category-picker]');
  var categoryName = categoryPicker.attr('data-tool-category');
  this.categoryPickers.removeClass('is-active');
  this.categoryMenus.removeClass('is-active');
  this.secondaryMenu.find('[data-tool-category="' + categoryName + '"]')
      .addClass('is-active');
  categoryPicker.addClass('is-active');
}
