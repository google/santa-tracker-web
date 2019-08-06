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

goog.provide('app.Snowblower');

goog.require('app.Constants');

/**
 * Windtunnel Snowblower class
 *
 * @param {!Element} context DOM element that wraps the snowblower.
 * @constructor
 */
app.Snowblower = function(context) {
  this.context_ = $(context);

  this.switchElem_ = this.context_.find('.snowblower-switch');

  this.stateCycle_ = [
    app.Constants.SNOWBLOWER_STATE_OFF,
    app.Constants.SNOWBLOWER_STATE_MED,
    app.Constants.SNOWBLOWER_STATE_HIGH
  ];

  this.stateClassMap_ = {};
  this.stateClassMap_[app.Constants.SNOWBLOWER_STATE_OFF] =
      app.Constants.SNOWBLOWER_SWITCH_CLASSNAMES[0];
  this.stateClassMap_[app.Constants.SNOWBLOWER_STATE_MED] =
      app.Constants.SNOWBLOWER_SWITCH_CLASSNAMES[1];
  this.stateClassMap_[app.Constants.SNOWBLOWER_STATE_HIGH] =
      app.Constants.SNOWBLOWER_SWITCH_CLASSNAMES[2];

  this.stateIndex_ = 1;
  this.stateChangeDelta_ = 1;

  this.onSwitchClicked_ = this.onSwitchClicked_.bind(this);
};

/**
 * Initializes the snowblower.
 */
app.Snowblower.prototype.init = function() {
  this.addEventListeners_();
};


/**
 * Removes event listeners and other cleanup.
 */
app.Snowblower.prototype.destroy = function() {
  this.removeEventListeners_();
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Snowblower.prototype.addEventListeners_ = function() {
  this.switchElem_.on('click', this.onSwitchClicked_);
};

/**
 * Un-binds event listeners.
 *
 * @private
 */
app.Snowblower.prototype.removeEventListeners_ = function() {
  this.switchElem_.off('click', this.onSwitchClicked_);
};

/**
 * @return {number} The current state.
 */
app.Snowblower.prototype.getState = function() {
  return this.stateCycle_[this.stateIndex_];
};

/**
 * Change switch position on click.
 *
 * @private
 */
app.Snowblower.prototype.onSwitchClicked_ = function() {
  var newIndex = this.stateIndex_ + this.stateChangeDelta_;
  if (newIndex < 0 || newIndex >= this.stateCycle_.length) {
    this.stateChangeDelta_ *= -1;
    newIndex = this.stateIndex_ + this.stateChangeDelta_;
  }
  this.stateIndex_ = newIndex;

  var opts = Object.keys(this.stateClassMap_).map(key => this.stateClassMap_[key]).join(' ');
  this.switchElem_.removeClass(opts);
  this.switchElem_.addClass(this.stateClassMap_[this.getState()]);

  window.santaApp.fire('sound-trigger', 'windtunnel_lever_snow');
};
