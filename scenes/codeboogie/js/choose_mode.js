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
'use strict';

goog.provide('app.ChooseMode');

goog.require('app.shared.Overlay');

/**
 * Choose map overlay.
 * @param {!jQuery} elem The gameover element.
 * @constructor
 * @struct
 */
app.ChooseMode = function(elem, stage) {
  this.elem = elem;
  this.stage = stage;
  this.callback_ = null;

  this.elem.on('click', '.grid__option', this.selectMode_.bind(this));
  this.stage.on('click', '.grid__option', this.selectStage_.bind(this));
  this.stage.on('click', '.choose-stage__back', this.back_.bind(this));

  this.overlay = new app.shared.Overlay(this.elem);
  this.stageOverlay = new app.shared.Overlay(this.stage);
};

/**
 * User chooses a mode.
 */
app.ChooseMode.prototype.selectMode_ = function(event) {
  this.mode = $(event.currentTarget).data('mode');

	if (this.mode === 'freestyle') {
		return this.stageOverlay.show();
	}

	this.continue_();
};

/**
 * User chooses a stage.
 */
app.ChooseMode.prototype.selectStage_ = function(event) {
	this.stage = $(event.currentTarget).data('stage');
	this.continue_();
};

/**
 * Back to choosing a mode.
 */
app.ChooseMode.prototype.back_ = function(event) {
	this.stageOverlay.hide();
};

/**
 * Set the map when the user chooses.
 */
app.ChooseMode.prototype.continue_ = function() {
	this.callback_(this.mode, this.stage);
	window.setTimeout(() => {
		this.overlay.hide();
		this.stageOverlay.hide();
	}, 100);
};

/**
 * Shows the share screen with an animation.
 * @param {function(string)} callback Runs when a map is selected.
 */
app.ChooseMode.prototype.show = function(callback) {
  this.callback_ = callback;
  this.overlay.show();
};
