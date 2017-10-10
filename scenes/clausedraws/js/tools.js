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
goog.require('app.Decoration');
goog.require('app.Spray');
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

  this.elem = $elem.find('.Tools');
  this.clipper = new app.Tool($elem, 'clipper', {x: 40, y: 0});
  this.hairdryer = new app.Tool($elem, 'hairdryer', {x: 100, y: 0});
  this.hairclean = new app.Tool($elem, 'hairclean', {x: 120, y: 10});
  this.hairgrow = new app.Tool($elem, 'hairgrow', {x: 110, y: 25});

  this.sprayRed = new app.Spray($elem, 'red');
  this.sprayOrange = new app.Spray($elem, 'orange');
  this.sprayYellow = new app.Spray($elem, 'yellow');
  this.sprayGreen = new app.Spray($elem, 'green');
  this.sprayCyan = new app.Spray($elem, 'cyan');
  this.sprayPurple = new app.Spray($elem, 'purple');
  this.sprayPink = new app.Spray($elem, 'pink');
  this.sprayBlue = new app.Spray($elem, 'blue');

  this.decorationSnowman = new app.Decoration($elem, 'snowman', {x: 40, y: 50}, $elem.find('#snowman')[0]);
  this.decorationBauble = new app.Decoration($elem, 'bauble', {x: 40, y: 50}, $elem.find('#bauble')[0]);
  this.decorationBow = new app.Decoration($elem, 'bow', {x: 50, y: 45}, $elem.find('#bow')[0]);
  this.decorationHolly = new app.Decoration($elem, 'holly', {x: 40, y: 45}, $elem.find('#holly')[0]);

  this.tools = [
    this.clipper,
    this.hairdryer,
    this.hairgrow,
    this.hairclean,

    this.sprayRed,
    this.sprayOrange,
    this.sprayYellow,
    this.sprayGreen,
    this.sprayCyan,
    this.sprayPurple,
    this.sprayPink,
    this.sprayBlue,

    this.decorationSnowman,
    this.decorationBauble,
    this.decorationBow,
    this.decorationHolly
  ];

  this.sprays = [
    this.sprayRed.spray,
    this.sprayOrange.spray,
    this.sprayYellow.spray,
    this.sprayGreen.spray,
    this.sprayCyan.spray,
    this.sprayPurple.spray,
    this.sprayPink.spray,
    this.sprayBlue.spray
  ];

  this.decorations = [
    this.decorationSnowman.decoration,
    this.decorationBauble.decoration,
    this.decorationBow.decoration,
    this.decorationHolly.decoration
  ];
};


/**
 */
app.Tools.prototype.start = function() {
  this.selectTool_ = this.selectTool_.bind(this);
  this.elem.on('click touchend', this.selectTool_);
};


/**
 * @param {!app.Mouse} mouse
 * @param {app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tools.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (this.selectedTool) {
    this.selectedTool.move(mouseCoords);
  }

  if (this.hairdryer.isSelected && mouseCoords.down) {
    app.utils.triggerStart('selfie_dryer');
  } else if (!mouseCoords.down) {
    app.utils.triggerStop('selfie_dryer');
  }

  if (this.clipper.isSelected && mouseCoords.down) {
    app.utils.triggerStart('selfie_shave');
  } else if (!mouseCoords.down) {
    app.utils.triggerStop('selfie_shave');
  }

  if (this.hairgrow.isSelected && mouseCoords.down) {
    app.utils.triggerOnce('selfie_spray_small');
  } else if (!mouseCoords.down) {
    app.utils.triggerReset('selfie_spray_small');
  }

  if (this.hairclean.isSelected && mouseCoords.down) {
    app.utils.triggerOnce('selfie_spray_big');
  } else if (!mouseCoords.down) {
    app.utils.triggerReset('selfie_spray_big');
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
    var coords = this.game_.mouse.coordinates();
    this.selectedTool.select(coords);
  }

  if (previousTool) {
    previousTool.deselect();
  }
};
