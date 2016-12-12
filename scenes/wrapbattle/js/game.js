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

goog.provide('app.Game');

goog.require('app.shared.Gameover');
goog.require('app.shared.LevelUp');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.SharedGame');

goog.require('app.AnimationPlayer');
goog.require('app.Character');
goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.Track');

goog.require('app.Sequencer');


/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @param {string} componentDir A path to the directory for the game.
 * @implements {SharedGame}
 * @constructor
 * @struct
 * @export
 */
app.Game = class {
  constructor(elem, componentDir) {
    this.elem = $(elem);
    this.componentDir = componentDir;

    this.gameStartTime = null;
    this.paused = false;
    this.isPlaying = false;
    this.lastFrame = 0;
    this.requestId = 0;
    this.responsiveKey = null;
    this.lastResponsiveKey = null;
    this.level = 0;
    this.powerUpActiveRendered = null;
    this.images = null;
    this.imageNames = null;
    this.imagesLoaded = null;

    this.scoreboard = new Scoreboard(this, this.elem.find('.board'),
        app.Levels.levels.length);
    this.gameoverDialog = new Gameover(this, this.elem.find('.gameover'));
    this.levelUp = new LevelUp(this, this.elem.find('.levelup'),
        this.elem.find('.levelup--number'));

    this.canvases = null;
    this.bgCanvas = null;
    this.bgContext = null;
    this.fgCanvas = null;
    this.fgContext = null;
    this.pbCanvas = null;
    this.pbContext = null;
    this.cacheCanvas = null;
    this.cacheContext = null;
    this.initCanvases();

    this.leftElf = new app.Character($('.djs--back .dj--left', elem)[0],
        $('.djs--front .dj--left', elem)[0], 'boy', componentDir,
        app.Constants.ELF_LEFT_OFFSET);
    this.rightElf = new app.Character($('.djs--back .dj--right', elem)[0],
        $('.djs--front .dj--right', elem)[0], 'girl', componentDir,
        app.Constants.ELF_RIGHT_OFFSET);


    this.track = new app.Track(this);
    this.controls = new app.Controls(this);
    this.points = 0;
    this.powerUp = 0;
    this.powerUpActive = false;
    this.litUpDirections = [];
    this.circlePositions = [];

    this.onFrame_ = this.onFrame_.bind(this);

    this.audioTracks = ['wrapbattle_track01', 'wrapbattle_track02',
        'wrapbattle_track03', 'wrapbattle_track04'];
    this.sequencer = new app.Sequencer();
    this.animationPlayer = new app.AnimationPlayer(this.leftElf, this.rightElf,
        this.sequencer);
    // this.sequencer.onBeat = (beat, bpm) => console.log('beat',bpm);
    this.bpmBasedElements = $('.audience-row, .speaker-top, .speaker-bottom');
  }

  /**
   * Initialize the canvases used in this game
   */
  initCanvases() {
    this.canvases = [];

    this.bgCanvas = $('.background-canvas', this.elem);
    this.bgContext = this.bgCanvas[0].getContext('2d');
    this.canvases.push(this.bgCanvas);

    this.fgCanvas = $('.foreground-canvas', this.elem);
    this.fgContext = this.fgCanvas[0].getContext('2d');
    this.canvases.push(this.fgCanvas);

    this.pbCanvas = $('.power-bar', this.elem);
    this.pbContext = this.pbCanvas[0].getContext('2d');
    this.canvases.push(this.pbCanvas);

    for (let i = 0; i < this.canvases.length; i++) {
      this.canvases[i][0].width = this.canvases[i].width();
      if (i != 0) {
        this.canvases[i][0].height = this.canvases[i].height();
      }
    }

    this.cacheCanvas = $(document.createElement("canvas"));
    this.cacheContext = this.cacheCanvas[0].getContext('2d');
    this.initCacheCanvas();
  }

  /**
   * Start the game
   * @export
   */
  start() {
    window.santaApp.fire('sound-trigger', 'wrapbattle_start_game');
    this.controls.setup();
    $(window).on('resize.wrapbattle', this.onResize_.bind(this));
    this.restart();
  }

  /**
   * Resets all game entities and restarts the game. Can be called at any time.
   */
  restart() {
    this.onResize_();
    this.level = 0;
    this.scoreboard.reset();
    this.points = 0;
    this.deactivatePowerup();
    this.track.cleanUp();

    this.sequencer.setTrack( this.audioTracks[0] );
    this.sequencer.play(()=> {
      //callback when music starts
      this.paused = false;
      this.gameStartTime = +new Date;
      this.track.initLevel(this.level, this.sequencer.getBPM());
      this.bpmBasedElements.css('animation-duration',
          60 / this.sequencer.getBPM() * 2 + 's');
      this.animationPlayer.cleanUp();
      this.leftElf.cleanUp();
      this.rightElf.cleanUp();
      this.unfreezeGame();
    });

    window.santaApp.fire('analytics-track-game-start', {gameid: 'wrapbattle'});
  }

  /**
   * Updates game state since last frame.
   * @param {number} delta Time elapsed since last update in milliseconds
   */
  update(delta) {
    this.litUpDirections = [false, false, false, false];

    this.track.update(this.controls.keysDown);
    this.render(delta);
    $('.points').text(this.points);

    if (this.responsiveKey === 'desktop') {
      this.leftElf.update(delta);
      this.rightElf.update(delta);
    }

    this.powerUp = Math.max(0, Math.min(1, this.powerUp));
    if (this.powerUp == 1 && !this.powerUpActive) {
      this.activatePowerup();
    }

    if (this.powerUpActive) {
      this.powerUp -= app.Constants.POWERUP_DECAY;

      if (this.powerUp <= 0) {
        this.deactivatePowerup();
      }
    }
  }

  /**
   * Renders the game state.
   * @param {number} delta Time elapsed since last update in milliseconds
   */
  render(delta) {
    if (this.powerUpActive != this.powerUpActiveRendered) {
      this.drawTrackLine();
    }

    this.track.render(delta, this.sequencer.getBPM());

    this.drawPowerBarFg();
    this.drawCircles();
  };

  /**
   * Initialize the cached arrows canvas
   */
  initCacheCanvas() {
    this.imageNames = ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'];
    this.images = {};
    this.imagesLoaded = 0;

    // fallback if images don't load
    setTimeout(this.setUpCacheCanvas.bind(this), 1000);
    this.imageNames.forEach(this.loadImage.bind(this));
  }

  /**
   * Load an image
   * @param  {string} name The filename
   */
  loadImage(name) {
    let image = new Image();

    image.onload = () => {
      this.images[name] = image;
      this.imagesLoaded++;
      if (this.imagesLoaded == 4) {
        this.setUpCacheCanvas();
      }
    };

    image.onerror = () => {
      image.onerror = null;
      setTimeout(() => {
        image.src += '?' + +new Date;
      }, 1000);
    }

    image.src = this.componentDir + `img/${name}.png`;
  }

  /**
   * Draw arrows to the cached arrows canvas
   */
  setUpCacheCanvas() {
    let arrowSize = app.Constants.ARROW_SIZE[this.responsiveKey];
    let arrowSpace = app.Constants.ARROW_SIZE.desktop +
        app.Constants.ARROW_MARGIN;
    this.cacheCanvas[0].height = arrowSpace * 4;
    this.cacheCanvas[0].width = arrowSpace * 8;

    // normal arrows
    this.cacheContext.fillStyle = app.Constants.COLORS.ARROW_FILL;
    this.drawCachedArrowRow(0);

    // hit arrows
    this.cacheContext.fillStyle = app.Constants.COLORS.ARROW_PASSED_FILL;
    this.cacheContext.globalAlpha = 1;
    this.drawCachedArrowRow(arrowSpace * 2);

    // Long arrow tails
    this.cacheContext.fillStyle = app.Constants.COLORS.ARROW_MULTI_FILL;
    this.cacheContext.shadowColor = app.Constants.COLORS.ARROW_MULTI_SHADOW;
    this.cacheContext.shadowBlur = app.Constants.ARROW_MULTI_SHADOW_BLUR;
    this.cacheContext.shadowOffsetY = app.Constants.ARROW_MULTI_SHADOW_OFFSET;
    this.cacheContext.save();
    this.cacheContext.translate(arrowSize / 2, arrowSpace * 3 + arrowSize / 2);
    this.cacheContext.beginPath();
    this.cacheContext.arc(0, 0, arrowSize / 2, 0, 2 * Math.PI);
    this.cacheContext.fill();
    this.cacheContext.restore();

    for (let i = 0; i < app.Constants.COLORS.ARROW_MULTI_RAINBOW.length; i++) {
      this.cacheContext.fillStyle = app.Constants.COLORS.ARROW_MULTI_RAINBOW[i];
      this.cacheContext.save();
      this.cacheContext.translate(arrowSpace * (i + 1) + arrowSize / 2,
          arrowSpace * 3 + arrowSize / 2);
      this.cacheContext.beginPath();
      this.cacheContext.arc(0, i, arrowSize / 2, 0, 2 * Math.PI);
      this.cacheContext.fill();
      this.cacheContext.restore();
    }
  }

  /**
   * Draw a row of cached arrows
   * @param  {number} yOffset Offset into the cache canvas
   */
  drawCachedArrowRow(yOffset) {
    let arrowSize = app.Constants.ARROW_SIZE[this.responsiveKey];
    let arrowSpace = app.Constants.ARROW_SIZE.desktop +
        app.Constants.ARROW_MARGIN;
    for (let i = 0; i < this.imageNames.length; i++) {
      let imageName = this.imageNames[i];
      this.cacheContext.save();
      this.cacheContext.translate(arrowSpace * i + arrowSize / 2,
          yOffset + arrowSize / 2);
      this.cacheContext.beginPath();
      this.cacheContext.arc(0, i, arrowSize / 2, 0, 2 * Math.PI);
      this.cacheContext.fill();
      this.cacheContext.drawImage(this.images[imageName],
          -app.Constants.ARROW_IMG_WIDTH / 2,
          -app.Constants.ARROW_IMG_HEIGHT / 2,
          app.Constants.ARROW_IMG_WIDTH,
          app.Constants.ARROW_IMG_HEIGHT);
      this.cacheContext.restore();
    }
  }

  /**
   * Draw the line that arrows cross
   */
  drawTrackLine() {
    let trackPosition = app.Constants.TRACK_LINE_POSITION[this.responsiveKey];

    this.bgContext.clearRect(0, 0, this.bgCanvas.width(), this.bgCanvas.height());
    if (this.powerUpActive) {
      this.bgContext.fillStyle = app.Constants.COLORS.TRACK_LINE_MEGA;
    } else {
      this.bgContext.fillStyle = app.Constants.COLORS.TRACK_LINE;
    }
    this.bgContext.fillRect(0, trackPosition, this.bgCanvas.width(), 2);
    this.powerUpActiveRendered = this.powerUpActive;
  };

  /**
   * Draw the background of the powerbar
   */
  drawPowerBarBg() {
    this.fgContext.clearRect(0, 0, this.fgCanvas.width(), this.fgCanvas.height());

    // powerup shadowy bg
    let powerUpMargin = app.Constants.POWERUP_MARGIN[this.responsiveKey];
    let powerUpInnerMargin = app.Constants.POWERUP_INNER_MARGIN[this.responsiveKey];
    let powerUpHeight = app.Constants.POWERUP_HEIGHT[this.responsiveKey];
    let powerUpWidth = this.fgCanvas.width() - powerUpMargin * 2;
    this.fgContext.fillStyle = app.Constants.COLORS.POWERUP_SHADOW;
    this.fgContext.fillRect(powerUpMargin, powerUpMargin, powerUpWidth,
        powerUpHeight + 2 * powerUpInnerMargin);

    let innerStart = powerUpMargin + powerUpInnerMargin;
    let innerEndX = powerUpMargin + powerUpWidth - powerUpInnerMargin;
    let centerY = powerUpMargin + powerUpHeight / 2;
    let innerWidth = powerUpWidth - powerUpInnerMargin * 2;
    let powerUpGradient = this.fgContext.createLinearGradient(innerStart, centerY,
        innerEndX, centerY);
    powerUpGradient.addColorStop(0, app.Constants.COLORS.GRADIENT_START);
    powerUpGradient.addColorStop(1, app.Constants.COLORS.GRADIENT_END);
    // powerup gradient bar
    this.fgContext.fillStyle = powerUpGradient;
    this.fgContext.fillRect(innerStart, innerStart, innerWidth,
        powerUpHeight);
  };

  /**
   * Draw the overlay on the powerbar showing its filled amount
   */
  drawPowerBarFg() {
    this.pbContext.clearRect(0, 0, this.pbCanvas.width(), this.pbCanvas.height());

    let powerUpMargin = app.Constants.POWERUP_MARGIN[this.responsiveKey];
    let powerUpInnerMargin = app.Constants.POWERUP_INNER_MARGIN[this.responsiveKey];
    let powerUpHeight = app.Constants.POWERUP_HEIGHT[this.responsiveKey];
    let powerUpWidth = this.pbCanvas.width() - powerUpMargin * 2;
    let innerStart = powerUpMargin + powerUpInnerMargin;
    let innerEndX = powerUpMargin + powerUpWidth - powerUpInnerMargin;
    let innerWidth = powerUpWidth - powerUpInnerMargin * 2;

    // powerup overlay
    this.pbContext.fillStyle = app.Constants.COLORS.POWERUP;
    this.pbContext.fillRect(innerEndX - innerWidth * (1 - this.powerUp),
        innerStart, innerWidth * (1 - this.powerUp),
        powerUpHeight);

    // powerup shine line
    this.pbContext.fillStyle = app.Constants.COLORS.POWERUP_SHINE;
    this.pbContext.fillRect(innerStart, innerStart +
        app.Constants.POWERUP_SHINE_POSITION, innerWidth * this.powerUp,
        app.Constants.POWERUP_SHINE_HEIGHT[this.responsiveKey]);

    // powerup current position marker
    this.pbContext.fillStyle = app.Constants.COLORS.POWERUP_MARKER;
    this.pbContext.fillRect(innerStart + innerWidth * this.powerUp, innerStart,
        app.Constants.POWERUP_MARKER_WIDTH[this.responsiveKey], powerUpHeight);
  };

  /**
   * Draw the circles arrows pass through
   */
  drawCircles() {
    let trackPosition = app.Constants.TRACK_LINE_POSITION[this.responsiveKey];
    let width = this.pbContext.canvas.width;
    let arrowSize = app.Constants.ARROW_SIZE[this.responsiveKey];
    let arrowMargin = app.Constants.ARROW_MARGIN;
    let arrowsWidth = 4 * arrowSize + 3 * arrowMargin;
    for (let i = 0; i < 4; i++) {
      let xOffset = (width - arrowsWidth) / 2 + i * (arrowSize + arrowMargin) +
          arrowSize / 2;
      this.pbContext.lineWidth = 2;
      if (this.powerUpActive) {
        this.pbContext.strokeStyle = app.Constants.COLORS.TRACK_LINE_MEGA;
      } else {
        this.pbContext.strokeStyle = app.Constants.COLORS.TRACK_LINE;
      }

      if (this.litUpDirections[i]) {
        let gradient= this.pbContext.createLinearGradient(xOffset - arrowSize / 2,
            trackPosition, xOffset + arrowSize / 2, trackPosition);
        gradient.addColorStop(0, app.Constants.COLORS.GRADIENT_START);
        gradient.addColorStop(1, app.Constants.COLORS.GRADIENT_END);
        this.pbContext.strokeStyle = gradient;
      }

      this.circlePositions[i] = xOffset;

      this.pbContext.beginPath();
      this.pbContext.arc(xOffset, trackPosition, arrowSize / 2, 0, 2 * Math.PI);
      this.pbContext.stroke();
    }
  }

  /**
   * Activate mega mode
   */
  activatePowerup() {
    this.sequencer.setMaxIntensity();
    this.elem.addClass('megamode');
    this.powerUpActive = true;
    this.bpmBasedElements.css('animation-duration',
        30 / this.sequencer.getBPM() * 2 + 's');
  };


  /**
   * Deactivate mega mode
   */
  deactivatePowerup() {
    this.sequencer.setNormalIntensity(this.powerUpActive);
    this.elem.removeClass('megamode');
    this.powerUpActive = false;
    this.powerUp = 0;
    this.bpmBasedElements.css('animation-duration',
        60 / this.sequencer.getBPM() * 2 + 's');
  };


  /**
   * Callback when current level is successfully completed
   */
  onLevelCompleted() {
    // Check for game end
    if (this.level + 1 === app.Levels.levels.length) {
      this.gameover();
    } else {
      //delay level change animation to sync with music
      this.sequencer.onNextBar(()=> {
        this.levelUp.show(this.level + 2, this.startNextLevel.bind(this,
          this.level + 1))
      });
    }
  }

  /**
   * Starts the specified level
   * @param  {number} level The level index
   */
  startNextLevel(level) {
    this.level = level;
    this.points = 0;
    this.deactivatePowerup();
    this.scoreboard.setLevel(this.level);
    this.track.cleanUp();

    this.sequencer.setTrack( this.audioTracks[this.level % this.audioTracks.length] );
    this.sequencer.play(()=> {
      //callback when music starts
      this.animationPlayer.cleanUp();
      this.leftElf.cleanUp();
      this.rightElf.cleanUp();
      this.track.initLevel(this.level, this.sequencer.getBPM());
      this.bpmBasedElements.css('animation-duration',
          60 / this.sequencer.getBPM() * 2 + 's');
    });

  }


  /**
   * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
   * Used both for game over and pausing.
   */
  freezeGame() {
    cancelAnimationFrame(this.requestId);
    this.isPlaying = false;
    this.sequencer.pause();
    this.elem.addClass('frozen');
  }

  /**
   * Unfreezes the game, starting the game loop as well.
   */
  unfreezeGame() {
    if (!this.isPlaying) {
      this.elem.removeClass('frozen');

      this.isPlaying = true;
      this.lastFrame = +new Date();
      this.requestId = window.requestAnimationFrame(this.onFrame_);
    }
  }

  /**
   * Game loop. Runs every frame using requestAnimationFrame.
   * @private
   */
  onFrame_() {
    if (!this.isPlaying) {
      return;
    }

    // Calculate delta since last frame.
    let now = +new Date();
    let delta = Math.min(1000, now - this.lastFrame);

    this.lastFrame = now;

    // Update game state
    this.update(delta);
    this.animationPlayer.update(now / 1000);

    this.sequencer.update();

    // Request next frame
    this.requestId = window.requestAnimationFrame(this.onFrame_);
  }

  /**
   * Pause the game.
   */
  pause() {
    this.paused = true;
    this.freezeGame();
  }

  /**
   * Resume the game.
   */
  resume() {
    if (this.gameStartTime) {
      this.sequencer.resume();
    }

    this.paused = false;
    this.unfreezeGame();
  }

  /**
   * Pauses/unpauses the game.
   */
  togglePause() {
    if (this.paused) {
      this.resume();
    } else if (this.isPlaying) {
      // Only allow pausing if the game is playing (not game over).
      this.pause();
    }
  }

  /**
   * Manage window resize
   * @private
   */
  onResize_() {
    let newResponsiveKey = $(window).width() < 800 ? 'mobile' : 'desktop';
    if (!this.lastResponsiveKey || this.lastResponsiveKey != newResponsiveKey) {
      this.lastResponsiveKey = this.responsiveKey;
      this.responsiveKey = newResponsiveKey;
      this.setUpCacheCanvas();
    }

    for (let i = 0; i < this.canvases.length; i++) {
      this.canvases[i][0].width = this.canvases[i].width();
      this.canvases[i][0].height = this.canvases[i].height();
    }

    this.drawTrackLine();
    this.drawPowerBarBg();

    this.leftElf.onResize();
    this.rightElf.onResize();
    this.track.renderTrack();
  }

  /**
   * The game is over.
   */
  gameover() {
    this.freezeGame();
    this.gameoverDialog.show();
    this.sequencer.onGameOver();
    this.leftElf.cleanUp();
    this.rightElf.cleanUp();
    this.animationPlayer.cleanUp();
    window.santaApp.fire('sound-trigger', 'wrapbattle_gameover');
  }

  /**
   * Dispose the game.
   * @export
   */
  dispose() {
    if (this.isPlaying) {
      let opts = {
        gameid: 'wrapbattle',
        timePlayed: new Date - this.gameStartTime,
        level: 1,
      };
      window.santaApp.fire('analytics-track-game-quit', opts);
    }

    this.freezeGame();

    window.cancelAnimationFrame(this.requestId);
    $(window).off('.wrapbattle');
    $(document).off('.wrapbattle');
    this.elem.off('.wrapbattle');

    this.levelUp.dispose();
  }
}
