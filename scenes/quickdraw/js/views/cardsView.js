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

goog.require('app.Constants');
goog.require('app.SVGUtils');
goog.require('app.Utils');
goog.require('app.EventEmitter');


app.view.CardsView = function(container) {
  app.EventEmitter.call(this);
  this.container = container;
  this.newround_card = container.find('.newround-card');
  this.timesup_card = container.find('.timesup-card');
  this.round_detail_card = container.find('.rounddetails-card');
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
    card.removeClass('visible');
    setTimeout(function() {
      card.hide();
      if(cb) {
        cb();
      }
    }.bind(this), 1000);
  }
};

app.view.CardsView.prototype.showNewRoundCard = function(options) {
  this.showCard(this.newround_card);

  this.newround_card.find('.slate__big-text').text(app.Utils.capitalize(options.word));
  this.newround_card.find('.newround-card__current-round').text(options.level);
  this.newround_card.find('.newround-card__total-rounds').text(app.Constants.TOTAL_LEVELS);

  var _callback = function() {
    if (options.onCardDismiss) {
      options.onCardDismiss();
    }
    this.hideCard(this.newround_card);
  }.bind(this);

  setTimeout(function() {
    this.newround_card
      .find('.newround-card__button')
      .on('touchend mouseup',function() {
        this.newround_card.off('touchend mouseup');
        _callback();
      }.bind(this));
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
  $drawingsWrapper.html('');

  if (roundsRecognized == 0) {
    $titleElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-title-noguess'));
    $sublineElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-subline-noguess'));
  } else {
    $titleElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-title-guess'));
    $sublineElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-subline-guess', 'roundsRecognized', roundsRecognized));
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

  if (round.recognized) {
    drawingElem.addClass('timesup-card__drawing--recognized');
  } else {
    drawingElem.addClass('timesup-card__drawing--not-recognized');
  }

  var svgElem = app.SVGUtils.createSvgFromSegments(round.drawing, 300, 225, {padding: 10});
  drawingElem.append(svgElem);

  drawingElem.on('touchend mouseup', function() {
    this.showRoundDetailsCard(round);
  }.bind(this));

  return drawingElem;
};


app.view.CardsView.prototype.showRoundDetailsCard = function(round) {
  //Section 1

  // - [ ] Round Details > Your Drawing > Replace word
  this.round_detail_card
    .find('.rounddetails-card__word')
    .text(round.word);
  // - [ ] Round Details > Your Drawing > Replace Drawing
  var svg = app.SVGUtils.createSvgFromSegments(round.drawing, 270, 180, {padding:10, color: 'rgba(0,0,0,1.00)'});
  var drawingElm = this.round_detail_card.find('.rounddetails-card__drawing--user');
  drawingElm.html('');
  drawingElm.append(svg);
  // - [ ] Round Details > Your Drawing > Add Santa Drawing (Prepare code)

  //Section 2

  //Section 3

  this.showCard(this.round_detail_card);

  this.round_detail_card
    .find('.rounddetails-card__back-btn')
    .off('touchend mouseup')
    .on('touchend mouseup', function() {
      this.hideCard(this.round_detail_card);
    }.bind(this));
};
