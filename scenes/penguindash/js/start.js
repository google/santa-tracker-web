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

goog.provide('app.Start');
goog.provide('Start');

goog.require('app.config.Levels');
goog.require('app.Constants');
goog.require('app.Penguin');
goog.require('app.Wave');


/**
 * Constructor for Phaser Game
 * @constructor
 */
app.Start = function(game) {
  this.game = game;
  game.pause = this.pause.bind(this);
  game.unpause = this.unpause.bind(this);
  game.setScale = this.setScale.bind(this);
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
  window.santaApp.fire('sound-trigger', 'pnd_slide_start');
  this.isMobileOrIE = window.innerWidth < 600 || window.innerHeight < 600 || typeof Object.assign != 'function';
  this.isLowPerformance = window.innerWidth < 350 || window.innerHeight < 350;
};


/**
 * Setup game functionality and start game. Called by Phaser.
 */
app.Start.prototype.create = function() {
  // State variables
  this.onPath = true;
  this.onFastIce = false;
  this.rendering = true;
  this.dead = false;
  this.timer = 0;
  this.totalTimer = 0;
  this.level = 1;
  this.maxLevels = app.Constants.TOTAL_LEVELS;
  this.movementForce = app.Constants.MOVEMENT_FORCE;
  this.movementMultiple = app.Constants.SPEED_MULTIPLE_DEFAULT;
  this.groups = [];
  this.gameStartTime = +new Date;

  // Phaser/Global world setup
  this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  this.game.scale.pageAlignHorizontally = true;
  this.game.scale.pageAlignVertically = true;
  this.world.setBounds(0, 0, app.Constants.WORLD_WIDTH,
      app.Constants.WORLD_HEIGHT);
  this.setScale(this.game.st_parent.scale);
  this.time.events.loop(Phaser.Timer.SECOND, this.updateCounter_, this);
  this.physics.startSystem(Phaser.Physics.ARCADE);

  // Setup Penguin
  this.penguin = new app.Penguin(this);
  this.camera.follow(this.penguin.elem);

  // Add background video
  if(!this.isMobileOrIE) {
    this.video = this.game.add.video('background');
    this.vidsprite = this.video.addToWorld(0, 0, 0, 0, 2.2, 3);
    this.video.play(true);
    this.wave = new app.Wave(this);
  }

  // Stuff for debugging
  this.debugElements = [];
  this.game.debug.reset();

  // Init User Input
  this.keys = this.game.input.keyboard.createCursorKeys();
  $(window).on('deviceorientation.penguindash',
      this.handleOrientation_.bind(this));

  // Start game
  this.initLevels_();
  this.showLevel_(1);
};


/**
 * Update canvas with game play. Called by Phaser.
 */
app.Start.prototype.update = function() {
  if (!this.isMobileOrIE) {
    this.wave.sendBack();
    this.world.sendToBack(this.vidsprite);
  }

  //this.game.debug.bodyInfo(this.penguin, 32, 32);
  // this.game.debug.body(this.penguin.elem);

  for (var i = 0; i < this.debugElements.length; i++) {
    //this.game.debug.bodyInfo(this.debugElements[i], 32, 32);
    // this.game.debug.body(this.debugElements[i]);
  }

  if (!this.onPath && !this.rendering) {
    this.dieAndRestart_();

    return;
  }

  if (!this.onFastIce) {
    this.movementMultiple = app.Constants.SPEED_MULTIPLE_DEFAULT;

    // Inertia
    this.penguin.multiplyVelocity(app.Constants.SPEED_DECAY_DEFAULT);
  }
  window.santaApp.fire('sound-trigger', {name: 'pnd_fast_ice', args: [this.onFastIce]});
  // Reset flags
  this.onPath = (this.rendering ? true : false);
  this.onMoving = false;
  this.onFastIce = false;
  this.rendering = false;
  this.accelerating = false;

  // Mouse handling
  if (this.keys.left.isDown) {
    this.penguin.elem.body.velocity.x -= this.movementForce * this.movementMultiple;
    this.accelerating = true;
  } else if (this.keys.right.isDown) {
    this.penguin.elem.body.velocity.x += this.movementForce * this.movementMultiple;
    this.accelerating = true;
  }
  if (this.keys.up.isDown) {
    this.penguin.elem.body.velocity.y -= this.movementForce * this.movementMultiple;
    this.accelerating = true;
  } else if (this.keys.down.isDown) {
    this.penguin.elem.body.velocity.y += this.movementForce * this.movementMultiple;
    this.accelerating = true;
  }

  if (this.accelerating) {
    // If the penguin is moving, the user probably worked out how to play.
    this.game.st_parent.tutorial.off();
  }

  if(this.accelerating) {
    this.penguin.boost();
  } else {
    this.penguin.slide();
  }

  var vol = ((Math.abs(this.penguin.elem.body.velocity.y) + Math.abs(this.penguin.elem.body.velocity.x))/1000);
  window.santaApp.fire('sound-trigger', {name: 'pnd_slide', args: [vol]});
  this.penguin.dustAlpha(vol*2 - 0.2);

  // Point toward direction of movement
  this.penguin.adjustAngle();

  // Handling for new position
  for (let index in this.levels[this.level - 1]) {
    if (this.levels[this.level - 1][index].continue) {
      let overlap = this.physics.arcade.overlap(
          this.penguin.elem, this.levels[this.level - 1][index].group,
          null, null, this);

      if (overlap) {
        this.onPath = true;
      }
    }

    this.additionalGroupHandling_(
        this.levels[this.level - 1][index],
        this.levels[this.level - 1][index].group);
  }
};


/**
 * Scale world when needed.
 * @param {number} scale A scale between 0 and 1 on how much to scale.
 */
app.Start.prototype.setScale = function(scale) {
  this.game.scale.setGameSize(this.game.st_parent.sceneElem.width() / scale,
      this.game.st_parent.sceneElem.height() / scale);
};


/**
 * Pause game.
 */
app.Start.prototype.pause = function() {
  this.game.paused = true;
  window.santaApp.fire('sound-trigger', 'pnd_slide_stop');
};


/**
 * Unpause game.
 */
app.Start.prototype.unpause = function() {
  this.game.paused = false;
  window.santaApp.fire('sound-trigger', 'pnd_slide_start');
};


/**
 * Initialize levels of the game.
 * @private
 */
app.Start.prototype.initLevels_ = function() {
  this.levels = [];
  this.levelData = app.config.Levels;

  // loop through levels
  for (let i = 0; i < this.maxLevels; i++) {
    let groups = this.initGroups_();

    // add items from the level config to respective group
    for (var e = 0; e < this.levelData[i].length; e++) {
      var item = this.levelData[i][e];
      if(item.g=='character') {
        if(!this.isLowPerformance) {
          if(this.isMobileOrIE) {
            var element = groups[item.g].group.create(item.x, item.y, 'element-' + item.t);
            this.additionalElementInit_(element, item);
          } else {
            var element = groups[item.g].group.create(item.x, item.y, 'sprite-' + item.t);
            this.additionalElementInit_(element, item);
          }
        }
      } else {
        if(!this.isLowPerformance || item.g!='obstacle') {
          var element = groups[item.g].group.create(
              item.x, item.y, 'element-' + item.t);
          this.additionalElementInit_(element, item);

          if (this.game.cache.checkImageKey('element-' + item.t + '-shadow')) {
            let element = groups['shadow'].group.create(
                item.x - 6, item.y + 4, 'element-' + item.t + '-shadow');
            this.additionalElementInit_(element, item);
          }
        }
      }
    }

    // add additional items depended on base layer
    this.additionalGroupInit_(groups, i);

    // push groups to level
    this.levels.push(groups);
  }
};


/**
 * Initialize groups of elements.
 * @return {object} Object of Phaser groups.
 * @private
 */
app.Start.prototype.initGroups_ = function() {
  var groups = {};

  for (var i = 0; i < app.Constants.GROUPS.length; i++) {
    let config = app.Constants.GROUPS[i];

    // Object.assign Polyfill
    if (typeof Object.assign != 'function') {
      Object.assign = function(target) {
        'use strict';
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var source = arguments[index];
          if (source != null) {
            for (var key in source) {
              if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
              }
            }
          }
        }
        return target;
      };
    }

    groups[config.id] = Object.assign({}, config);

    groups[config.id].group = this.add.group();
    groups[config.id].group.enableBody = true;
    groups[config.id].group.physicsBodyType = Phaser.Physics.ARCADE;
    groups[config.id].group.visible = false;

    if (config.front) {
      this.world.bringToTop(groups[config.id].group);
    } else {
      this.world.sendToBack(groups[config.id].group);
    }
  }

  return groups;
};


/**
 * Additional initialization pieces specific an element.
 * @param {Phaser.object} element Phaser element
 * @param {object} item Config for element.
 * @private
 */
app.Start.prototype.additionalElementInit_ = function(element, item) {
  if(item.g != 'character') {
    element.body.immovable = true;
    element.scale.setTo(0.5, 0.5);
  }

  switch (item.g) {
    case 'obstacle':
      this.debugElements.push(element);

      let config = app.Constants.OBSTACLES[item.t];

      if (config && config.width && config.height && config.square) {
        element.body.setSize(config.width, config.height);
      }
      else {
        element.body.setCircle(config.width / 4);
      }

      if (config && config.offsetX && config.offsetY) {
        element.body.offset.x = config.offsetX;
        element.body.offset.y = config.offsetY;
      }
    break;

    case 'character':
      element.body.setSize(0, 0);
      if(!this.isMobileOrIE) {
        if (typeof app.Constants.CHARACTERS[item.t] != 'undefined') {
          element.animations.add('default', app.Constants.CHARACTERS[item.t]);
        } else {
          element.animations.add('default');
        }
        element.animations.play('default', 10, true);
      }
    break;

    case 'moving':
      if (item.c && item.c.axis && item.c.movement) {
        let params = {};
        params[item.c.axis] = item.c.movement;

        this.add.tween(element)
            .to(params, item.c.duration || app.Constants.SPEED_MOVING_ICE,
            Phaser.Easing.Cubic.InOut, true, 0, -1, true);
      }
    break;

    case 'ice':
      /*var random = Math.floor(Math.random() * 4);
      element.angle = 90 * random;
      element.anchor.set(0.5);*/
    break;

    case 'finish':
    case 'scenery':
      // this.debugElements.push(element);

      element.anchor.set(0.5, 0.5);

      if (item.r) {
        element.angle = item.r;
      }

      if (item.f == 'y') {
        element.scale.y = -0.5;
      }

      if (item.f == 'x') {
        element.scale.x = -0.5;
      }
    break;

    default:
    break;
  }
};


/**
 * Additional initialization pieces specific to groups.
 * @param {object} config Settings for group.
 * @param {!Phaser.object} group Phaser object for group.
 * @private
 */
app.Start.prototype.additionalGroupInit_ = function(groups, level) {
  for (var key in groups) {
    switch (key) {
      case 'prize':
        // present on ice or snow
        let ice = groups['snow'].group.children.concat(groups['ice'].group.children);
        let snowLen = groups['snow'].group.children.length;

        let presentsCount = Math.floor(ice.length / 2);

        for (var i = 0; i < presentsCount; i++) {
          let presentType = Math.floor(Math.random() * 6) + 1;

          // choose an ice/snow to put the present on, avoiding start and end lines
          let iceNum = Math.floor(Math.random() * (ice.length - 1)) + 1;
          while(iceNum==snowLen-1) {
            iceNum = Math.floor(Math.random() * (ice.length - 1)) + 1;
          }

          let icePlacement = ice[iceNum];

          let presentX = icePlacement.x + 50 +
              (icePlacement.width - 120) * Math.random();
          let presentY = icePlacement.y + 50 +
              (icePlacement.width - 120) * Math.random();

          let element = groups[key].group.create(presentX, presentY,
              'element-present' + presentType);
          this.additionalElementInit_(element, {g: 'prize'});
        }
      break;
    }
  }
};


/**
 * Additional update handling specific to groups.
 * @param {object} config Settings for group.
 * @param {!Phaser.object} group Phaser object for group.
 * @private
 */
app.Start.prototype.additionalGroupHandling_ = function(config, group) {
  if (config.update) {
    for (let i = 0; i < config.update.length; i++) {
      switch (config.update[i]) {
        case 'fast':
          this.physics.arcade.overlap(
              this.penguin.elem, group,
              this.overlapFastIce_, null, this);
        break;

        case 'moving':
          var anyOverlap = false;

          group.forEach(function(element) {
            var overlap = this.physics.arcade.overlap(
              this.penguin.elem, element,
              this.overlapMovement_, null, this);

            if (overlap) {
              anyOverlap = true;
            }
          }, this);

          if (!anyOverlap) {
            this.movingOffset = null;
          }
        break;

        case 'prize':
          this.physics.arcade.overlap(
              this.penguin.elem, group,
              this.overlapPrize_, null, this);
        break;

        case 'finish':
          this.physics.arcade.overlap(
              this.penguin.elem, group,
              this.finishLevel_, null, this);
        break;

        case 'collide':
          this.physics.arcade.collide(
              this.penguin.elem, group, function(){
                window.santaApp.fire('sound-trigger', 'pnd_hit');
              });
        break;
      }
    }
  }
};


/**
 * Show specific level of game.
 * @param {number} level Level number starting from 1.
 * @private
 */
app.Start.prototype.showLevel_ = function(level) {

  var lvl = level || this.level;

  // Hide previous level
  if (this.levels[lvl-2]) {
    for (var index in this.levels[lvl-2]) {
      this.levels[lvl-2][index].group.visible = false;
    }
  }

  // Show current level
  for (var index in this.levels[lvl-1]) {
    this.levels[lvl-1][index].group.visible = true;
  }

  // Center penguin in first cell
  this.penguin.centerInElement(this.levels[lvl-1]['snow'].group.getChildAt(0));

  // Bring obstacles and scenery to front
  this.world.bringToTop(this.levels[lvl-1].obstacle.group);
  this.world.bringToTop(this.levels[lvl-1].scenery.group);

  // Set rendering flag for start
  this.rendering = true;

  // Set onPath flag for start
  this.onPath = true;
};


/**
 * Update timer.
 * @private
 */
app.Start.prototype.updateCounter_ = function() {
  this.timer++;

  this.game.st_parent.scoreboard.onFrame(-1);
};


/**
 * Overlap callback for fast ice.
 * @private
 */
app.Start.prototype.overlapFastIce_ = function() {
  this.onFastIce = true;

  if (this.movementMultiple == 1) {
    this.movementMultiple = app.Constants.SPEED_MULTIPLE_FAST;
    this.penguin.multiplyVelocity(this.movementMultiple);
  }
};


/**
 * Additional update handling specific to groups.
 * @param {!Phaser.group} group1 Group object for penguin.
 * @param {!Phaser.group} group2 Group object for scene element.
 * @private
 */
app.Start.prototype.overlapMovement_ = function(group, group2) {
  this.onMoving = true;

  if (this.movingOffset == null) {
    this.movingOffset = {x: group2.x, y: group2.y};
    /*var offset = {
      x: group2.x - this.movingOffset.x,
      y: group2.y - this.movingOffset.y
    };*/
  }

  var offset = {
    x: group2.x - this.movingOffset.x,
    y: group2.y - this.movingOffset.y
  };

  this.penguin.elem.x += offset.x;
  this.penguin.elem.y += offset.y;

  this.movingOffset = {x: group2.x, y: group2.y};
};


/**
 * Overlap callback for prize.
 * @param {!Phaser.group} penguin Group object for penguin.
 * @param {!Phaser.group} prize Group object for prize element.
 * @private
 */
app.Start.prototype.overlapPrize_ = function(penguin, prize) {
  prize.kill();
  window.santaApp.fire('sound-trigger', 'pnd_pickup');
  this.game.st_parent.scoreboard.addScore(app.Constants.POINTS_GIFT_BASIC);
};


/**
 * Run animation for falling and restart level.
 * @private
 */
app.Start.prototype.dieAndRestart_ = function() {
  var t;

  if (!this.dead) {
    t = 10;
    window.santaApp.fire('sound-trigger', 'pnd_freeze');
    window.santaApp.fire('sound-trigger', 'pnd_slide_stop');
    this.penguin.die();
    this.dead = true;

    window.setTimeout(() => {
      this.dead = false;
      this.restartLevel_();
      this.game.st_parent.scoreboard.onFrame(-app.Constants.TIME_LOSE);
    }, 2500);
  }

  this.penguin.multiplyVelocity(app.Constants.SPEED_DECAY_FAST);
};


/**
 * Finish level and advance to next if not at end.
 * @param {!Phaser.group} penguin Group object for penguin.
 * @param {!Phaser.group} finish Group object for finish element.
 */
app.Start.prototype.finishLevel_ = function(penguin, finish) {
  //console.log('y: ' + penguin.body.overlapY);
  //console.log('x: ' + penguin.body.overlapX);

  this.pause();

  if (this.level >= this.maxLevels) {
    this.gameover_();
  } else {
    this.level++;
    this.game.st_parent.scoreboard.setLevel(this.level - 1);
    this.game.st_parent.scoreboard.addScore(app.Constants.POINTS_LEVEL_COMPLETE);
    this.game.st_parent.levelUp.show(this.level, this.restartLevel_.bind(this));
    window.santaApp.fire('sound-trigger', 'pnd_level_up');
  }
};


/**
 * Restart game at current level.
 * @private
 */
app.Start.prototype.restartLevel_ = function() {
  this.totalTimer += this.timer;
  this.timer = 0;
  this.penguin.reset();
  this.showLevel_();
  this.unpause();
  window.santaApp.fire('sound-trigger', 'pnd_restart');
};


/**
 * Stops the game as game over. Displays the game over screen as well.
 */
app.Start.prototype.gameover_ = function() {
  this.game.st_parent.freezeGame();
  this.game.st_parent.gameoverView.show();
  window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
  window.santaApp.fire('sound-trigger', 'pnd_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'penguindash',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: new Date - this.gameStartTime
  });
};


/**
 * Device orientation callback.
 */
app.Start.prototype.handleOrientation_ = function(event) {
  let e = event.originalEvent;

  // Device Orientation API
  if (e.gamma && e.beta && e.alpha && !this.game.paused && !this.dead) {
    var x = e.gamma; // range [-90,90], left-right
    var y = e.beta;  // range [-180,180], top-bottom
    var z = e.alpha; // range [0,360], up-down
    this.penguin.elem.body.velocity.x += x * 0.5;
    this.penguin.elem.body.velocity.y += y * 0.25;
    if(Math.abs(x) > 10 || Math.abs(y) > 5) {
      this.game.st_parent.tutorial.off();
    }
  }
};
