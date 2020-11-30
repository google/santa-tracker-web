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
goog.require('app.HandwritingAPI');
goog.require('app.Utils');
goog.require('app.EventEmitter');


/**
 * @constructor
 */
app.view.CardsView = function(container, importPath) {
  app.EventEmitter.call(this);

  this.importPath = importPath;

  this.handwritingAPI = new app.HandwritingAPI();

  this.container = container;
  this.newround_card = container.find('.newround-card');
  this.timesup_card = container.find('.timesup-card');
  this.round_detail_card = container.find('.rounddetails-card');
  this.newround_card.hide();
  this.timesup_card.hide();
  this.round_detail_card.hide();
};


app.view.CardsView.prototype = Object.create(app.EventEmitter.prototype);


app.view.CardsView.prototype.showCard = function(card, cb) {
  card.isVisible = true;
  card.show({
    duration: 0,
    complete: () => {
      card.addClass('visible');
      cb && cb();
    },
  });
};


app.view.CardsView.prototype.hideCard = function(card, cb) {
  card.isVisible = false;
  if (card.hasClass('visible')) {
    card.removeClass('visible');
    window.setTimeout(() => {
      card.hide();
      cb && cb();
    }, 1000);
  }
};


app.view.CardsView.prototype.showNewRoundCard = function(options) {
  this.showCard(this.newround_card);

  var word = app.Utils.getItemTranslation(this.container, options.word);
  this.newround_card.find('.slate__big-text').text(app.Utils.capitalize(word));
  this.newround_card.find('.newround-card__current-round').text(options.level);
  this.newround_card.find('.newround-card__total-rounds').text(app.Constants.TOTAL_LEVELS);

  var _callback = () => {
    if (options.onCardDismiss) {
      options.onCardDismiss();
    }
    this.hideCard(this.newround_card);
  };

  window.setTimeout(() => {
    this.newround_card
      .find('.newround-card__button')
      .on('touchend mouseup', () => {
        this.newround_card.find('.newround-card__button').off('touchend mouseup');
        _callback();
      });
  }, 1000);
};


app.view.CardsView.prototype.showTimesUpCard = function(rounds, callback) {
  this.hideCard(this.newround_card);
  this.showCard(this.timesup_card);

  var roundsRecognized = rounds.filter((r) => r.recognized == true).length;

  var $titleElem = this.timesup_card.find('.timesup-card__title');
  var $sublineElem = this.timesup_card.find('.timesup-card__subline');
  var $drawingsWrapper = this.timesup_card.find('.timesup-card__drawings');
  $drawingsWrapper.html('');

  if (roundsRecognized == 0) {
    $titleElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-title-noguess'));
    $sublineElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-subline-noguess'));
    window.santaApp.fire('sound-ambient', 'music_ingame_gameover');
  } else {
    window.santaApp.fire('sound-trigger', 'qd_game_win');
    $titleElem.text(app.Utils.getTranslation(this.container, 'quickdraw-timesup-title-guess'));
    $sublineElem.text(app.Utils.getInterpolatedTranslation(
      app.Utils.getTranslation(this.container, 'quickdraw-timesup-subline-guess'),
      'recognized',
      roundsRecognized));
  }

  window.ga('send', 'event', 'game', 'recognized', 'speedsketch', roundsRecognized);

  var modelWidth = 300;
  var modelHeight = 225;

  rounds.forEach((round) => {
    $drawingsWrapper.append(this.createDrawingElem(round, modelWidth, modelHeight));
  });

  this.timesup_card
    .find('.timesup-card__button')
    .off('touchend mouseup')
    .on('touchend mouseup', () => {
      window.santaApp.fire('sound-trigger', 'generic_button_click');
      if (callback) {
        callback('NEW_GAME');
      }
      this.hideCard(this.timesup_card);
    });
};


app.view.CardsView.prototype.createDrawingElem = function(round, width, height) {
  const drawingElem = $('<div>')
    .addClass('timesup-card__drawing');
  drawingElem.tabIndex = 0;  // acts like a button

  if (round.recognized) {
    drawingElem.addClass('timesup-card__drawing--recognized');
  } else {
    drawingElem.addClass('timesup-card__drawing--not-recognized');
  }

  const svgElem = app.SVGUtils.createSvgFromSegments(round.drawing, width, height, {padding: 10});
  drawingElem.append(svgElem);

  drawingElem.on('click', () => this.showRoundDetailsCard(round));

  return drawingElem;
};


app.view.CardsView.prototype.showRoundDetailsCard = function(round) {
  this.round_detail_card.scrollTop(0);
  this.showCard(this.round_detail_card);
  this.round_detail_card.scrollTop(0);

  //Section 1
  this.round_detail_card
    .find('.rounddetails-card__title')
    .text(app.Utils.getInterpolatedTranslation(
        app.Utils.getTranslation(this.container, 'quickdraw-rounddetails-title'),
        'thing',
        app.Utils.getItemTranslation(this.container, round.word)));
  var drawingElem = this.round_detail_card.find('.rounddetails-card__drawing--user');
  var svg = app.SVGUtils.createSvgFromSegments(round.drawing, drawingElem.width(), drawingElem.width() * 0.736, {padding: 25, color: 'rgba(0,0,0,1.00)'});
  drawingElem.html('');
  drawingElem.append(svg);


  //Section 2
  var filename = round.word.replace(/\s+/g, '-').toLowerCase();
  this.round_detail_card
  .find('.rounddetails-card__santa-title')
  .text(app.Utils.getInterpolatedTranslation(
      app.Utils.getTranslation(this.container, 'quickdraw-rounddetails-santa-version'),
      'thing',
      app.Utils.getItemTranslation(this.container, round.word)));
  var santaElem = this.round_detail_card.find('.rounddetails-card__drawing--santa .rounddetails-card__drawing-inner');
  santaElem.css('background-image', "url('" + this.importPath + "img/drawings/" + filename + ".svg')");

  //Section 3
  if (round.drawing && round.drawing.length > 0) {
    this.round_detail_card.find('.rounddetails-card__similar-drawings').show();
    if (round.recognized) {
      this.round_detail_card.find('.rounddetails-card__similar-drawings-title--not-recognized').hide();
      this.round_detail_card.find('.rounddetails-card__similar-drawings-title--recognized').show();
    } else {
      this.round_detail_card.find('.rounddetails-card__similar-drawings-title--recognized').hide();
      this.round_detail_card.find('.rounddetails-card__similar-drawings-title--not-recognized').show();
    }
    this.fetchAndShowDrawingNeighbors(round);
  } else {
    this.round_detail_card.find('.rounddetails-card__similar-drawings').hide();
  }

  this.round_detail_card
    .find('.rounddetails-card__back-btn')
    .off('touchend mouseup')
    .on('touchend mouseup', () => {
      this.hideCard(this.round_detail_card);
    });
};


app.view.CardsView.prototype.fetchAndShowDrawingNeighbors = function(round) {
  var neighborElems = this.round_detail_card.find('.rounddetails-card__similar-drawing');
  if (round.drawing && round.drawing.length > 0) {
    this.handwritingAPI.getSimilarDrawings(round.drawing, round.width, round.height)
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(jqXHR, textStatus, errorThrown);
    })
    .done((data) => {
      data = this.handwritingAPI.parseResponse(data);
      var neighbors = data.filter((d) => d.neighbor);

      neighbors = neighbors.filter((neighbor) => {
        return neighbor.word != round.word;
      });

      neighbors = neighbors.slice(0, 3);

      // Loop over the three neighbors
      for (var i = 0; i < 3; i++) {
        if (neighbors.length > i) {
          var elem = $(neighborElems[i]);
          elem.show();

          // Set Text
          var textElem = elem.find('p');
          textElem.text(app.Utils.getItemTranslation(this.container,
						     neighbors[i].word) || neighbors[i].word);

          // Set Reference Element
          var referenceElem = elem.find('.rounddetails-card__similar-drawing-reference');
          referenceElem.html('');
          var svgReference = app.SVGUtils.createSvgFromSegments(round.drawing, elem.width(), elem.width() * 0.736, {padding: 10, color: "rgba(0,0,0,0.15)"});
          referenceElem.append(svgReference);

          // Set Neighbor Element
          var neighborElem = elem.find('.rounddetails-card__similar-drawing-neighbor');
          neighborElem.html('');
          var svgNeighbor = app.SVGUtils.createSvgFromSegments(neighbors[i].neighbor, elem.width(), elem.width() * 0.736, {padding: 10, order: 1});
          neighborElem.append(svgNeighbor);

        } else {
          $(neighborElems[i]).hide();
        }
      } //ENDFOR
    });
  } else {
    neighborElems.hide();
  }
};
