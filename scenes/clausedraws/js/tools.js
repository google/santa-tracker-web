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
goog.require('app.Eraser');
goog.require('app.LayerTool');
goog.require('app.Stamp');
goog.require('app.Pen');
goog.require('app.SprinkleSpray');
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

  this.primaryMenu = $elem.find('.Tools--primary');
  this.categoryPickers = this.primaryMenu.find('[data-tool-category-picker]');

  this.secondaryMenu = $elem.find('.Tools--secondary');
  this.categoryMenus = this.secondaryMenu.find('[data-tool-category-menus]');

  this.categoryPickers.on('click.clausedraws', this.onCategoryClick_.bind(this));

  // this.clipper = new app.SprinkleSpray($elem, 'clipper', {x: 40, y: 0});
  // this.hairdryer = new app.LayerTool($elem, 'hairdryer', app.LayerTool.Layer.BACKGROUND, $elem.find('#snowbg')[0]);
  // this.hairclean = new app.Eraser($elem, 'hairclean', {x: 120, y: 10});
  // this.hairgrow = new app.LayerTool($elem, 'hairgrow', app.LayerTool.Layer.FOREGROUND, $elem.find('#snowfg')[0]);

  // this.sprayRed = new app.Pen($elem, 'red');
  // this.sprayOrange = new app.Pen($elem, 'orange');
  // this.sprayYellow = new app.Pen($elem, 'yellow');
  // this.sprayGreen = new app.Pen($elem, 'green');
  // this.sprayCyan = new app.Pen($elem, 'cyan');
  // this.sprayPurple = new app.Pen($elem, 'purple');
  // this.sprayPink = new app.Pen($elem, 'pink');
  // this.sprayBlue = new app.Pen($elem, 'blue');

  // this.decorationSnowman = new app.Stamp($elem, 'snowman', {x: 40, y: 50}, $elem.find('#snowman')[0]);
  // this.decorationBauble = new app.Stamp($elem, 'bauble', {x: 40, y: 50}, $elem.find('#bauble')[0]);
  // this.decorationBow = new app.Stamp($elem, 'bow', {x: 50, y: 45}, $elem.find('#bow')[0]);
  // this.decorationHolly = new app.Stamp($elem, 'holly', {x: 40, y: 45}, $elem.find('#holly')[0]);

  // this.tools = [
  //   this.clipper,
  //   this.hairdryer,
  //   this.hairgrow,
  //   this.hairclean,

  //   this.sprayRed,
  //   this.sprayOrange,
  //   this.sprayYellow,
  //   this.sprayGreen,
  //   this.sprayCyan,
  //   this.sprayPurple,
  //   this.sprayPink,
  //   this.sprayBlue,

  //   this.decorationSnowman,
  //   this.decorationBauble,
  //   this.decorationBow,
  //   this.decorationHolly
  // ];
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
      this.selectedTool.startSound();
    } else {
      this.selectedTool.stopSound();
    }
  }
};


/**
 * Handle clicks on the toolbox to select a tool
 * @param {!Event} e DOM click event
 * @private
 */
app.Tools.prototype.selectTool_ = function(e) {
  var previousTool = this.selectedTool;

  this.selectedTool = this.tools.filter(function(tool) {
    if (tool.container[0] === e.target && !tool.isSelected) {
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
  var category = $(e.target).closest('[data-tool-category-picker]')
      .attr('data-tool-category');
  console.log(category);
  this.categoryMenus.removeClass('is-active');
  this.secondaryMenu.find('[data-tool-category="' + category + '"]')
      .addClass('is-active');
}
