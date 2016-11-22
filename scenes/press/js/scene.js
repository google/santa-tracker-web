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

goog.provide('app.Scene');

goog.require('app.Models');
goog.require('app.shared.ShareButtons');

/**
 * Press Scene class
 * Main class responsible for kicking off the scene's additional functionality
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(context) {
  this.gallery = $('#press-secondary', context);

  this.shareButtons = new app.shared.ShareButtons(/** @type {!Element} */(context.querySelector('footer')));

  this.cards = Cards;
  this.active = '';
  this.$filters = this.gallery.find('[press-filter]');
  this.$cards = this.gallery.find('[press-card]');

  this.init_();
};

/**
 * Return cards models.
 * @return {!Array.<Object>} array of model objects to fill cards
 */

app.Scene.prototype.getCards = function() {
  return this.cards;
};

/**
 * Functionality needed to fire on show.
 */

app.Scene.prototype.show = function(active) {
  this.$cards = this.gallery.find('[press-card]');

  this.active = active;
  this.setActiveFilter_();
};

/**
 * Initializes the Scene by biding some events
 *
 * @private
 */

app.Scene.prototype.init_ = function() {
  this.$filters.on('click', this.onFilterSelect_.bind(this));
  this.unlockCards_();
};

/**
 * Unlock cards based on date.
 *
 * @private
 */

app.Scene.prototype.unlockCards_ = function() {
  this.cards.forEach(function(element, index) {
    var moduleName = element.key;
    if (window.santaApp.sceneIsOpen(moduleName) === false) {
      element.locked = true;
    }
  });
};

/**
 * Event to select filter for scenes.
 *
 * @private
 */

app.Scene.prototype.onFilterSelect_ = function(e) {
  e.preventDefault();

  this.active = $(e.target).attr('press-filter');
  this.$filters.removeClass('active');
  $(e.target).addClass('active');

  this.setActiveFilter_();
};

/**
 * Set active filter for list view.
 *
 * @private
 */

app.Scene.prototype.setActiveFilter_ = function() {
  this.$cards = this.gallery.find('[press-card]');
  this.$cards.addClass('fading-out');

  setTimeout(function() {
    this.$cards.attr('hidden', '');

    var $cards = this.active ? this.$cards.filter('[press-' + this.active + ']') : this.$cards;
    $cards.removeAttr('hidden').each(function(index, element) {
      $(element).removeClass('clear-desktop-row clear-tablet-row');
      if (index % 3 == 0) {
        $(element).addClass('clear-desktop-row');
      }
      if (index % 2 == 0) {
        $(element).addClass('clear-tablet-row');
      }

      setTimeout(function() {
        $(element).removeClass('fading-out');
      }.bind(this), (index * 50 + 50));    
    }.bind(this));
  }.bind(this), 500);
};