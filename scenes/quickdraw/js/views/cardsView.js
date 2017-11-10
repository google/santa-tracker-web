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

goog.provide('app.view.CardsView');

goog.require('app.config');
goog.require('app.SVGUtils');
goog.require('app.EventEmitter');


app.view.CardsView = function(container) {
  app.EventEmitter.call(this);
  this.newround_card = container.find('.newround-card');
  this.timesup_card = container.find('.timesup-card');
  this.newround_card.hide();
  this.timesup_card.hide();
};


app.view.CardsView.prototype = Object.create(app.EventEmitter.prototype);


app.view.CardsView.prototype.showCard = function(card, cb) {
  card.isVisible = true;
  card.show({
    duration:0,
    complete: function() {
        card.addClass('visible');
        if (cb) {
          cb()
        }
    }
  });
};


app.view.CardsView.prototype.hideCard = function(card, cb) {
  card.isVisible = false;
  if (card.hasClass('visible')) {
    card.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
      card.hide();
      card.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
      if(cb) {
        cb();
      }
    });
    card.removeClass('visible');
  }
};


app.view.CardsView.prototype.showNewRoundCard = function(options) {
  this.showCard(this.newround_card);

  this.newround_card.find('.slate__big-text').text(options.word);
  this.newround_card.find('.newround-card__current-round').text(options.level);
  this.newround_card.find('.newround-card__total-rounds').text(app.config.num_rounds);

  var _callback = function() {
    if (options.onCardDismiss) {
      options.onCardDismiss();
    }
    this.hideCard(this.newround_card);
  }.bind(this);

  setTimeout(function() {
    this.newround_card
      .find('.newround-card__button')
      .off('touchend mouseup')
      .on('touchend mouseup',function() {
        _callback();
      });
  }.bind(this), 1000);
};


app.view.CardsView.prototype.showTimesUpCard = function(rounds, callback) {
  this.hideCard(this.newround_card);
  this.showCard(this.timesup_card);

  var roundsRecognized = rounds.filter(function(r) {
    return r.recognized == true
  }).length;

  var $titleElem = this.timesup_card.find('.timesup-card__title');
  var $sublineElem = this.timesup_card.find('.timesup-card__subline');
  var $drawingsWrapper = this.timesup_card.find('.timesup-card__drawings');

  if (roundsRecognized == 0) {
    $titleElem.text('Oops!');
    $sublineElem.text('Robby didn\'t recognized any of your drawings.');
  } else {
    $titleElem.text('Well done!');
    $sublineElem.text('Robby recognized ' + roundsRecognized + ' of your drawings.');
  }

  rounds.forEach(function(round) {
    $drawingsWrapper.append(this.createDrawingElem(round));
  }.bind(this));

  this.timesup_card
    .find('.timesup-card__button')
    .off('touchend mouseup')
    .on('touchend mouseup', function() {
      if (callback) {
          callback('NEW_GAME');
      }
      this.hideCard(this.timesup_card);
    }.bind(this));
};

app.view.CardsView.prototype.createDrawingElem = function(round) {
  var drawingElem = $('<div>')
    .addClass('timesup-card__drawing');

  var svgElem = app.SVGUtils.createSvgFromSegments(round.drawing, 360, 240, {padding: 25});
  drawingElem.append(svgElem);

  return drawingElem;
};
