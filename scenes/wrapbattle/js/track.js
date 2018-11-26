/*
 * Copyright 2016 Google Inc. All rights reserved.
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

goog.provide('app.Track');

goog.require('app.Arrow');
goog.require('app.Constants');
goog.require('app.Levels');


app.Track = class {
  /**
   * The arrow and gameplay track.
   * @param {app.Game} game The game
   */
  constructor(game) {
    this.game = game;
    this.trackPosition = 0;
    this.message = $('.message', game.elem);
    this.comboMessage = $('.combo-message', game.elem);
    this.canvasContainer = $('.arrow-track', game.elem);
    this.track = $('.track', game.elem);
    this.arrows = [];
    this.misses = 0;
    this.ready = false;

    this.levelEndTrackPosition = null;
    this.isNextComboElfLeft = null;
    this.levelFailed = null;
    this.points = null;
    this.lastInCombo = null;
    this.multipleArrows = null;
    this.bpm = null;
    this.activeCombo = null;
    this.combos = null;
    this.messageText = null;
    this.isHoldingKey = null;
    this.level = null;
  }

  /**
   * Initialize the arrows for the given level
   * @param  {number} level The level index
   * @param  {number} bpm The song speed
   */
  initLevel(level, bpm) {
    this.levelFailed = false;
    this.misses = 0;
    this.trackPosition = 0;
    this.arrows = [];
    this.comboMessage.removeClass('is-active');
    this.message.removeClass('is-active');

    this.bpm = bpm;
    this.level = app.Levels.levels[level];

    this.combos = [];
    let trackLinePosition = app.Constants.TRACK_LINE_POSITION[this.game.responsiveKey];
    for (let i = 0; i < this.level.track.length; i++) {
      let chunk = this.level.track[i];
      if (chunk.comboIndex != undefined) {
        let combo = app.Levels.combos[chunk.comboIndex];
        for (let j = 0; j < combo.arrows.length; j++) {
          let arrow = combo.arrows[j];
          let arrowData = {
            combo: i,
            directions: arrow.directions,
            trackLocation: (chunk.beat + arrow.beat) *
                app.Constants.TRACK_PIXELS_PER_BEAT,
            length: arrow.length * app.Constants.TRACK_PIXELS_PER_BEAT
          }

          if (j == combo.arrows.length - 1) {
            arrowData.lastInCombo = true;
            this.combos.push(true);
          }

          this.arrows.push(new app.Arrow(arrowData,
              this.game.cacheCanvas));
        }
      } else {
        let arrowData = {
          directions: chunk.directions,
          trackLocation: chunk.beat * app.Constants.TRACK_PIXELS_PER_BEAT,
          length: chunk.length * app.Constants.TRACK_PIXELS_PER_BEAT
        }
        this.arrows.push(new app.Arrow(arrowData,
            this.game.cacheCanvas));
        this.combos.push(false);
      }
    }

    this.resetComboElf();
    this.levelEndTrackPosition = -this.level.length *
        app.Constants.TRACK_PIXELS_PER_BEAT + trackLinePosition;
    this.trackPosition = app.Constants.TRACK_PIXELS_PER_BEAT *
        this.level.startDelay + trackLinePosition;

    this.renderTrack();
    this.ready = true;
  }

  /**
   * Render all arrows to the track
   */
  renderTrack() {
    if (!this.level) {
      return;
    }

    let canvasMaxHeight = app.Constants.CANVAS_MAX_HEIGHT;
    let canvasTotalHeight = this.level.length *
        app.Constants.TRACK_PIXELS_PER_BEAT;

    this.canvases = [];
    this.canvasContainer.empty();
    for (var i = 0; i <= canvasTotalHeight / canvasMaxHeight + 1;
        i++) {
      let canvas = $(document.createElement("canvas"));
      canvas[0].height = canvasMaxHeight;
      canvas[0].width = this.canvasContainer.width();
      this.canvases.push(canvas);
      this.canvasContainer.append(canvas);
    }

    this.canvasContainer.css('transform', `translateY(${this.trackPosition}px)`);
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      this.renderArrow(this.arrows[i]);
    }
  }

  renderArrow(arrow) {
    let arrowSize = app.Constants.ARROW_SIZE[this.game.responsiveKey];
    let canvasMaxHeight = app.Constants.CANVAS_MAX_HEIGHT;
    let canvasStartIndex = Math.floor((arrow.location - arrowSize / 2) /
        canvasMaxHeight);
    let canvasEndIndex = Math.floor((arrow.location + arrowSize / 2 +
        (arrow.length || 0)) / canvasMaxHeight);

    arrow.render(this.trackPosition, this.game.responsiveKey,
      this.canvases[canvasStartIndex], canvasStartIndex * canvasMaxHeight);

    if (canvasStartIndex != canvasEndIndex) {
      arrow.render(this.trackPosition, this.game.responsiveKey,
        this.canvases[canvasEndIndex], canvasEndIndex * canvasMaxHeight);
    }
  }

  /**
   * Checks whether the keys that are currently down match the correct arrows.
   * @param {Array<number>} keysDown The keys that are currently being held down
   */
  checkArrows(keysDown) {
    let accuracy;
    let keysUsed = [];
    for (let i = 0; i < keysDown.length; i++) {
      keysUsed.push(false);
    }

    this.points = 0;
    this.activeCombo = null;

    for (let i = 0; i < this.arrows.length; i++) {
      let arrow = this.arrows[i];
      if (arrow.passed) {
        continue;
      }

      let boundaries = this.getArrowBoundaries(arrow);

      if (boundaries.arrowPosition > this.track.height() +
          app.Constants.ARROW_SIZE[this.game.responsiveKey] / 2) {
        break;
      }

      if (this.arrowInRange(arrow, boundaries)) {
        this.lightUpDirections(arrow);

        if (arrow.data.combo != undefined) {
          this.activeCombo = arrow.data.combo;
        }

        // Check that all directions needed are in the keysDown list
        let keyToPlay;
        var success = true;
        arrow.directions.forEach(function(direction, index) {
          let hit = keysDown.indexOf(direction);
          if (hit >= 0) {
            keysUsed[hit] = true;
            keyToPlay = direction;
          } else {
            success = false;
          }
        });
        if (success) {
          if (arrow.length && arrow.caught) {
            this.updateDisplayValues(app.Constants.HIT_SCORES.HOLD);
            if (!this.isHoldingKey) {
              window.santaApp.fire('sound-trigger', {name: 'wrapbattle_long', args: [this.bpm] });
            }
            this.isHoldingKey = true;
          } else {
            if (!arrow.caught) {

              if (arrow.directions.length > 1) {
                this.multipleArrows = true;
              }
              accuracy = this.checkAccuracy(arrow, boundaries);
              arrow.caught = true;
              this.renderArrow(arrow);

              if (arrow.data.lastInCombo) {
                if (this.combos[arrow.data.combo]) {
                  this.updateDisplayValues(app.Constants.HIT_SCORES.COMBO);
                  this.registerCombo(true);
                  this.lastInCombo = true;
                }
              }
            }
          }
        }

        if (arrow.length) {
          this.renderArrow(arrow);
        }
      } else if (boundaries.arrowPosition < boundaries.arrowEnd) {
        if (!arrow.passed) {
          arrow.passed = true;

          if (!arrow.caught) {
            this.renderArrow(arrow);
          }
        }

        if (!arrow.caught) {
          accuracy = app.Track.ACCURACY.MISS;
          this.misses++;
          if (this.misses > 5 && !this.levelFailed) {
            this.levelFailed = true;
            // this.game.restartLevel();
            this.game.gameover();
          }
        }
      } else if (!success && this.isHoldingKey) {
        //just released key
        this.isHoldingKey = false;
        window.santaApp.fire('sound-trigger', {name: 'wrapbattle_stop_long', args: [this.bpm] });
      }
    }

    if (keysUsed.indexOf(false) >= 0) {
      accuracy = app.Track.ACCURACY.MISS;
    }

    this.registerAccuracy(accuracy);
  }

  /**
   * Calculate the start and end locations for the given arrow
   * @param  {app.Arrow} arrow The arrow
   * @return {Object} An object containing the arrow's boundaries
   */
  getArrowBoundaries(arrow) {
    let boundaries = {};
    let defaultArrowEnd = app.Constants.TRACK_LINE_POSITION[this.game.responsiveKey] -
        app.Constants.ARROW_SIZE[this.game.responsiveKey] * .75;
    boundaries.arrowBegin = app.Constants.TRACK_LINE_POSITION[this.game.responsiveKey] +
        app.Constants.ARROW_SIZE[this.game.responsiveKey] * .75;
    boundaries.arrowEnd = arrow.length ? defaultArrowEnd - arrow.length :
        defaultArrowEnd;
    boundaries.arrowPosition = arrow.location + this.trackPosition;
    return boundaries;
  }

  /**
   * @param  {app.Arrow} arrow The arrow
   * @param {Object} opt_boundaries Precalculated arrow boundaries
   * @return {boolean} Whether the arrow is in range of the target zone
   */
  arrowInRange(arrow, opt_boundaries) {
    let boundaries = opt_boundaries;
    if (!boundaries) {
      boundaries = this.getArrowBoundaries(arrow);
    }
    return boundaries.arrowPosition > boundaries.arrowEnd &&
      boundaries.arrowPosition < boundaries.arrowBegin;
  }

  /**
   * Light up active directions on the track
   * @param  {app.Arrow} arrow The arrow
   */
  lightUpDirections(arrow) {
    arrow.directions.forEach(function(direction) {
      switch (direction) {
        case app.Constants.DIRECTIONS.UP:
          this.game.litUpDirections[1] = true;
          break;
        case app.Constants.DIRECTIONS.DOWN:
          this.game.litUpDirections[2] = true;
          break;
        case app.Constants.DIRECTIONS.LEFT:
          this.game.litUpDirections[0] = true;
          break;
        case app.Constants.DIRECTIONS.RIGHT:
          this.game.litUpDirections[3] = true;
          break;
      }
    }, this);
  }

  /**
   * @param  {app.Arrow} arrow The arrow
   * @param {Object} opt_boundaries Precalculated arrow boundaries
   * @return {app.Track.ACCURACY} The accuracy message
   */
  checkAccuracy(arrow, opt_boundaries) {
    let boundaries = opt_boundaries;
    if (!boundaries) {
      boundaries = this.getArrowBoundaries(arrow);
    }

    let message;
    let accuracy = Math.abs(boundaries.arrowPosition -
        app.Constants.TRACK_LINE_POSITION[this.game.responsiveKey]);
    if (accuracy < app.Constants.HIT_SCORES.PERFECT.accuracy) {
      message = app.Track.ACCURACY.PERFECT;
    } else if (accuracy < app.Constants.HIT_SCORES.GOOD.accuracy) {
      message = app.Track.ACCURACY.GOOD;
    } else {
      message = app.Track.ACCURACY.OK;
    }

    return message;
  }

  /**
   * Update score, powerbar, and feedback message
   * @param  {Object} type The hit type
   */
  updateDisplayValues(type) {
    this.points += type.points;
    this.game.powerUp += type.powerup;
    this.game.powerUp = Math.max(0, Math.min(1, this.game.powerUp));

    if (type.textKey) {
      this.messageText = app.I18n.getMsg(type.textKey);
    }
  }

  /**
   * Flash a message complimenting a completed combo, and play the combo animation
   * @param  {boolean} success Whether the combo was completed successfully
   */
  registerCombo(success) {
    if (success) {
      this.comboMessage.addClass('is-active');
      setTimeout(function() {
        this.comboMessage.removeClass('is-active');
      }.bind(this), 500);
    }

    this.playWrapAnimation(success);
    this.resetComboElf();
   }

  /**
   * Flash a message about the accuracy of the key hit
   */
  showAccuracyMessage() {
    if (this.messageText) {
      this.message.text(this.messageText);
      this.message.addClass('is-active');

      setTimeout(function() {
        this.message.removeClass('is-active');
      }.bind(this), 300);
    }
  }

  /**
   * Update the game with the accuracy of this arrow hit/miss
   * @param  {app.Track.ACCURACY<number>|undefined} accuracy The accuracy of the last user input
   */
  registerAccuracy(accuracy) {
    this.messageText = '';
    if (accuracy) {

      let soundTrigger;


      switch (accuracy) {
        case app.Track.ACCURACY.MISS:
          this.updateDisplayValues(app.Constants.HIT_SCORES.MISS);

          if (this.combos[this.activeCombo]) {
            this.game.animationPlayer.queueAnimation(app.Step.FAIL,
                this.isNextComboElfLeft);
            this.combos[this.activeCombo] = false;
            soundTrigger = 'wrapbattle_miss';
            this.registerCombo(false);
          }
          break;
        case app.Track.ACCURACY.OK:
          this.updateDisplayValues(app.Constants.HIT_SCORES.OK);
          this.misses = 0;
          soundTrigger = 'wrapbattle_correct';
          break;
        case app.Track.ACCURACY.GOOD:
          this.updateDisplayValues(app.Constants.HIT_SCORES.GOOD);
          this.misses = 0;
          soundTrigger = 'wrapbattle_correct';
          break;
        case app.Track.ACCURACY.PERFECT:
          this.updateDisplayValues(app.Constants.HIT_SCORES.PERFECT);
          this.misses = 0;
          soundTrigger = 'wrapbattle_correct';
          break;
      }
      // play special sound on double keypress
      if (this.multipleArrows) {
        if (accuracy !== app.Track.ACCURACY.MISS) {

          window.santaApp.fire('sound-trigger', {name: 'wrapbattle_correct', args: [this.bpm]});
        }
        this.multipleArrows = false;
      } else if (this.lastInCombo) {
        this.lastInCombo = false;
        window.santaApp.fire('sound-trigger', 'wrapbattle_correct');
      } else if (soundTrigger) {
        window.santaApp.fire('sound-trigger', soundTrigger);
      }

    }

    this.showAccuracyMessage();
  }


  /**
   * Play a character animation in response to a correct key press
   * @param  {boolean} success Whether the present was wrapped successfully
   */
  playWrapAnimation(success) {
    let random = Math.random();
    let animation;
    if (random < 0.33) {
      animation = app.Step.WRAP_BLUE;
    } else if (random < 0.66) {
      animation = app.Step.WRAP_GREEN;
    } else {
      animation = app.Step.WRAP_RED;
    }

    this.game.animationPlayer.playWrapAnimation(success, animation,
        this.isNextComboElfLeft);
  }

  /**
   * Play a character animation in response to a correct key press
   */
  resetComboElf() {
    this.isNextComboElfLeft = !this.isNextComboElfLeft;
  }

  /**
   * Updates the track state
   * @param {Array<number>} keysDown The keys that are currently being held down
   */
  update(keysDown) {
    if (!this.ready) {
      return;
    }

    this.checkArrows(keysDown);
    this.game.points += this.points;
    this.game.scoreboard.addScore(this.points);

    // Double points for mega mode
    if (this.game.powerUpActive) {
      this.game.points += this.points;
      this.game.scoreboard.addScore(this.points);
    }
  }

  /**
   * Renders the track state
   * @param {number} delta Time in millieseconds since last render
   * @param {number} bpm Beats per minute of the current song
   */
  render(delta, bpm) {
    if (!this.ready || this.levelFailed) {
      return;
    }
    let deltaSeconds = delta / 1000;
    this.trackPosition -= (deltaSeconds / (60 / bpm)) *
        app.Constants.TRACK_PIXELS_PER_BEAT;

    this.canvasContainer.css('transform', `translateY(${this.trackPosition}px)`);

    let trackLinePosition = app.Constants.TRACK_LINE_POSITION[this.game.responsiveKey];
    if (this.trackPosition <= this.levelEndTrackPosition - trackLinePosition) {
      this.game.onLevelCompleted();
      this.ready = false;
    }
  }

  /**
   * Clean up track state
   */
  cleanUp() {
    this.canvases = [];
    this.canvasContainer.empty();
  }
}

/**
 * Accuracy buckets
 * @enum {number}
 */
app.Track.ACCURACY = {
  MISS: 1,
  OK: 2,
  GOOD: 3,
  PERFECT: 4
};
