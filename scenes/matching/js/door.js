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

goog.provide('Door');

/**
 * Holds a reference to a Door and its state (completed, matched, opened etc).
 * @param {string} id
 * @param {!jQuery} $el
 * @param {function} clickHandler
 * @param {string} cardClass
 * @constructor
 */
var Door = function(id, $el, clickHandler, cardClass) {
  this.elem_ = $el;
  this.cardClass_ = cardClass;
  this.clickHandler_ = clickHandler;

  this.id = id;
  this.uniqueId = Door.ID_COUNTER++;
  this.isCompleted = false;
  this.isOpened = false;
  this.isMismatched = false;

  this.setCard();
  this.enable();

  this.attachEvents_();
};

/**
 * Unique id counter.
 * @type {number}
 */
Door.ID_COUNTER = 0;

/**
 * Attaches the click handler to the door.
 * @private
 */
Door.prototype.attachEvents_ = function() {
  this.elem_.on('click', function() {
    this.clickHandler_(this);
  }.bind(this));
};

/**
 * Removes the event handlers of the door;
 */
Door.prototype.destroy = function() {
  this.elem_.off('click');
};

/**
 * Removes additional states or classes from a door so it goes back to its
 * initial state.
 */
Door.prototype.reset = function() {
  if (this.isOpened) {
    this.close();
  }

  this.isCompleted = false;

  this.elem_
    .find(Constants.SELECTOR_CARD)
    .attr('class', 'card');

  this.elem_
    .attr('class', 'door')
    .off('click');
};

/**
 * Set the door to be closed.
 */
Door.prototype.close = function() {
  this.elem_.removeClass(Constants.CLASS_DOOR_OPEN);
  this.isOpened = false;
  this.isMismatched = false;
};

/**
 * Set the door to be open.
 */
Door.prototype.open = function() {
  this.elem_.addClass(Constants.CLASS_DOOR_OPEN);
  this.isOpened = true;
};

/**
 * Set the door to be either closed or opened depending on its state.
 */
Door.prototype.toggle = function() {
  if (this.isOpened) {
    this.close();
  } else {
    this.open();
  }
};

/**
 * Set a door to be completed (e.g., when a match is found).
 **/
Door.prototype.complete = function() {
  this.isCompleted = true;
  this.isMismatched = false;
};

/**
 * Set a card background for this door
 * with a class.
 */
Door.prototype.setCard = function() {
  this.elem_
    .find(Constants.SELECTOR_CARD)
    .addClass(this.cardClass_);
};

/**
 * Enables the door to look playable (green).
 */
Door.prototype.enable = function() {
  this.elem_
    .addClass(Constants.CLASS_DOOR_ENABLED);
};

/**
 * Disables the door to look unplayable (red).
 */
Door.prototype.disable = function() {
  this.elem_
    .removeClass(Constants.CLASS_DOOR_ENABLED);
};

