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

goog.provide('app.DanceLevel');
goog.provide('app.DanceLevelOptions');
goog.provide('app.DanceLevelResult');
goog.provide('app.DanceStatus');
goog.require('app.Level');
goog.require('app.LevelResult');

/**
 * Dance result constants.
 * @enum {string}
 */
app.DanceStatus = {
  NO_STEPS: 'NO_STEPS',
  NOT_ENOUGH_STEPS: 'NOT_ENOUGH_STEPS',
  WRONG_STEPS: 'WRONG_STEPS',
  TOO_MANY_STEPS: 'TOO_MANY_STEPS',
  SUCCESS: 'SUCCESS'
};

/**
 * @typedef {{
 *   startBlocks: string,
 *   toolbox: string,
 *   idealBlockCount: number,
 *   steps: Array.<app.Step>,
 *   stage: string,
 *   bpm: number,
 *   longerIntro: boolean,
 *   freestyle: boolean,
 *   requiredBlocks: Array.<string>,
 *   fadeTiles: boolean,
 *   specialMove: app.Step
 * }}
 */
app.DanceLevelOptions;

/**
 * A maze level where the goal is to navigate a player through a maze.
 * @param {app.DanceLevelOptions} options for this level.
 * @extends app.Level
 * @constructor
 */
app.DanceLevel = class extends app.Level {
  constructor(options) {
    super(options);

    this.insertWhenRun = true;

    this.type = 'dance';

    this.freestyle = options.freestyle || false;
    this.steps = options.steps;
    this.track = options.track;
    this.bpm = options.bpm;
    this.longerIntro = options.longerIntro || false;
    this.stage = options.stage || 'stage0';
    this.idealBlockCount = options.idealBlockCount || Infinity;
    this.requiredBlocks = options.requiredBlocks || [];
    this.fadeTiles = options.fadeTiles == null ? true : options.fadeTiles;
    this.ceilingLights = this.stage === 'stage2' || this.stage === 'stage3';
    this.floorLights = this.stage === 'stage3';
    this.specialMove = options.specialMove;
  }

  /**
   * Optionally creates an intro animation for when this level starts.
   *
   * @return {!app.DanceLevelResult}
   */
  introAnimation() {
    let danceStatus = app.DanceStatus.NO_STEPS;
    let animation = this.createAnimationQueue([], danceStatus);
    let introBars = this.longerIntro ? 4 : 2;

    // Demo 4 bars of the idle music first. Final bar is countdown.
    for (var i = 1; i < introBars; i++) {
      animation.unshift({
        teacherStep: app.Step.IDLE,
        playerStep: app.Step.IDLE,
        title: app.I18n.getMsg('CB_watchClosely'),
        isIntro: true
      });
    }

    return new app.DanceLevelResult(false, null, {
      animationQueue: animation,
      danceStatus: danceStatus,
      endTitle: app.I18n.getMsg('CB_yourTurn')
    });
  }

  /**
   * Validates a blockly execution and returns a smart hint to user.
   *
   * @param {!Array.<app.BlockEvaluation>} playerSteps
   * @param {!app.Blockly} blockly wrapper.
   * @return {!app.DanceLevelResult} a user friendly level result.
   */
  processResult(playerSteps, blockly) {
    // Guard for invalid results.
    if (blockly.hasEmptyContainerBlocks()) {
      // Block is assumed to be "if" or "repeat" if we reach here.
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CB_resultEmptyBlockFail'),
          {skipAnimation: true});
    }

    if (blockly.hasExtraTopBlocks()) {
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CB_resultExtraTopBlockFail'),
          {skipAnimation: true});
    }

    // Too long freestyle dance?
    var playerStepCount = playerSteps.filter(s => !!s.step).length;
    if (this.freestyle &&
        playerStepCount > app.DanceLevel.FREESTYLE_STEP_LIMIT) {
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CB_resultTooManySteps'),
          {skipAnimation: true});
    }

    var danceStatus = this.evaluateStatus(playerSteps);
    var animationQueue = this.createAnimationQueue(playerSteps, danceStatus);
    var levelComplete = danceStatus === app.DanceStatus.SUCCESS;
    var code = blockly.getUserCode();
    var missingBlocks = blockly.getMissingBlocks(this.requiredBlocks);
    var numEnabledBlocks = blockly.getCountableBlocks().length;

    var endTitleMsg = ''

    if (!this.freestyle) {
      endTitleMsg = danceStatus === app.DanceStatus.NO_STEPS ? 'CB_yourTurn' :
          levelComplete ? 'CB_success' : 'CB_tryAgain';
    }

    var allowRetry = true;
    var message = null;
    var shareUrl = this.serialize(animationQueue);

    if (missingBlocks.length) {
      message = levelComplete ?
          app.I18n.getMsg('CB_resultMissingBlockSuccess') :
          app.I18n.getMsg('CB_resultMissingBlockFail');
    } else if (!levelComplete) {
      if (this.idealBlockCount !== Infinity &&
          numEnabledBlocks < this.idealBlockCount) {
        message = app.I18n.getMsg('CB_resultTooFewBlocksFail');
      } else {
        message = app.I18n.getMsg('CB_resultGenericFail');
      }
    } else if (numEnabledBlocks > this.idealBlockCount) {
      message = app.I18n.getMsg('CB_resultTooManyBlocksSuccess');
    } else if (this.freestyle) {
      message = app.I18n.getMsg('CB_shareMoves');
      endTitleMsg = 'CB_keepDancing';
    } else {
      allowRetry = false;
    }

    return new app.DanceLevelResult(levelComplete, message, {
      allowRetry,
      animationQueue: animationQueue,
      code: code,
      endTitle: app.I18n.getMsg(endTitleMsg),
      danceStatus: danceStatus,
      idealBlockCount: this.idealBlockCount,
      missingBlocks: missingBlocks,
      freestyle: this.freestyle,
      shareUrl: shareUrl
    });
  }

  /**
   * Processes the steps chosen by the player, deciding how the animation
   * should play. Will edit the step array for animation purposes in some
   * cases.
   *
   * @param {Array.<app.BlockEvaluation>} playerSteps steps taken.
   * @return {app.DanceStatus}
   */
  evaluateStatus(playerSteps) {
    if (this.freestyle) {
      this.steps = playerSteps.map(x => x.step)
    }

    let stepCount = 0;
    for (let i = 0, block = null; block = playerSteps[i]; i++) {
      // Ignore highlight only blocks
      if (!block.step) {
        continue;
      }

      if (stepCount >= this.steps.length) {
        return app.DanceStatus.TOO_MANY_STEPS;
      }
      if (block.step !== this.steps[stepCount]) {
        playerSteps.splice(stepCount + 1, playerSteps.length);
        return app.DanceStatus.WRONG_STEPS;
      }
      stepCount++;
    }
    if (stepCount === 0) {
      return app.DanceStatus.NO_STEPS;
    } else if (stepCount < this.steps.length) {
      return app.DanceStatus.NOT_ENOUGH_STEPS;
    } else {
      return app.DanceStatus.SUCCESS;
    }
  }

  /**
   * Creates an animation timeline for a provided player steps.
   *
   * @param {Array.<app.BlockEvaluation>} playerSteps
   * @param {app.DanceStatus} result
   * @returns {Array.<app.AnimationItem>}
   */
  createAnimationQueue(playerSteps, result) {
    let queue = [];
    playerSteps = playerSteps.filter(b => b.step);

    if (this.freestyle) {
      this.steps = playerSteps.map(x => x.step);
    }

    for (let i = 0, step = null; step = this.steps[i]; i++) {
      let playerStep = playerSteps[i];

      let animation = {
        teacherStep: step,
        playerStep: playerStep ? playerStep.step : 'watch',
        tile: step,
        blockId: playerStep && playerStep.blockId,
        title: app.I18n.getMsg('CB_' + step)
      };

      queue.push(animation);
    }

    if (result === app.DanceStatus.WRONG_STEPS) {
      if (playerSteps.length === this.steps.length) {
        queue.push({
          teacherStep: app.Step.WATCH,
          playerStep: app.Step.FAIL,
          title: app.I18n.getMsg('CB_oops')
        });
      } else {
        queue[playerSteps.length].playerStep = app.Step.FAIL;
        queue[playerSteps.length].title = app.I18n.getMsg('CB_oops');
      }
    }

    if (result === app.DanceStatus.TOO_MANY_STEPS) {
      let extraBlock = playerSteps[this.steps.length];
      queue.push({
        teacherStep: app.Step.WATCH,
        playerStep: extraBlock.step,
        blockId: extraBlock.blockId,
        title: app.I18n.getMsg('CB_oops')
      });
      queue.push({
        teacherStep: app.Step.WATCH,
        playerStep: app.Step.FAIL,
        title: app.I18n.getMsg('CB_oops')
      });
    }

    if (result === app.DanceStatus.SUCCESS && !this.freestyle) {
      let specialMove = this.specialMove || app.Step.CARLTON;

      queue.push({
        teacherStep: specialMove,
        playerStep: specialMove,
        title: app.I18n.getMsg('CB_success')
      });
    }

    if (!(this.freestyle && result === app.DanceStatus.NO_STEPS)) {
      queue.unshift({
        teacherStep: app.Step.IDLE,
        playerStep: app.Step.IDLE,
        title: app.I18n.getMsg(result === app.DanceStatus.NO_STEPS ?
            'CB_watchClosely' :
            'CB_letsDance'),
        isCountdown: true,
        isIntro: true
      });
    }

    return queue;
  }

  /**
   * Specifies css class names to apply when running this level.
   *
   * @returns {string}
   */
  className() {
    return super.className() + ' level--' + this.stage +
        ' level--bpm' + this.bpm +
        (this.freestyle ? ' level--freestyle' : '');
  }

  /**
   * Loads a custom level from serialized string.
   *
   * @param {string} level
   * @return {app.DanceLevel}
   */
  static deserialize(level) {
    let stage = null;
    let steps = [];
    level = window.atob(level);
    for (let i = 0, val = 0; i < level.length; i++) {
      val = parseInt(level[i], 16);

      if (i === 0) {
        stage = app.DanceLevel.SERIALIZE_LEVELS[parseInt(level[i], 16)];
        if (stage == null) return;
      } else if (i < app.DanceLevel.FREESTYLE_STEP_LIMIT + 1) {
        let step = app.DanceLevel.SERIALIZE_STEPS[parseInt(level[i], 16)];
        if (step == null) return;
        steps.push(step);
      } else {
        // Too long dance.
        return;
      }
    }

    return new app.DanceLevel({
        bpm: stage.bpm,
        track: stage.track,
        longerIntro: true,
        stage: stage.stage,
        steps: steps,
        toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
            app.blocks.miniBlockXml('dance_pointRight') +
            app.blocks.miniBlockXml('dance_stepLeft') +
            app.blocks.miniBlockXml('dance_stepRight') +
            app.blocks.miniBlockXml('dance_jump') +
            app.blocks.miniBlockXml('dance_splits') +
            app.blocks.miniBlockXml('dance_hip') +
            app.blocks.miniBlockXml('controls_repeat'),
        specialMove: stage.specialMove
    });
  }

  /**
   * Creates a level url from a freestyle dance.
   *
   * @param {Array.<AnimationItem>} animationQueue
   * @return {string}
   */
  serialize(animationQueue) {
    let level = goog.array.findIndex(app.DanceLevel.SERIALIZE_LEVELS,
        l => l.stage === this.stage);
    let steps = animationQueue.map(item => {
      return app.DanceLevel.SERIALIZE_STEPS.indexOf(item.teacherStep);
    }).filter(i => i >= 0);

    // Guards and validations.
    if (!this.freestyle) { return; }
    if (steps.length === 0) { return; }

    // Format url.
    return '?dance=' + btoa(level + steps.join(''));
  }
};

/**
 * Order of steps used for serialization.
 *
 * @const {Array.<app.Step>}
 */
app.DanceLevel.SERIALIZE_STEPS = [
  app.Step.LEFT_ARM,
  app.Step.RIGHT_ARM,
  app.Step.LEFT_FOOT,
  app.Step.RIGHT_FOOT,
  app.Step.JUMP,
  app.Step.SPLIT,
  app.Step.SHAKE
];

/**
 * Order of levels used for serialization.
 *
 * @const {Array.<{stage, bpm, track, specialMove}>}
 */
app.DanceLevel.SERIALIZE_LEVELS = [
  {
    stage: 'stage1',
    bpm: 120,
    track: 0,
    specialMove: app.Step.CARLTON
  },
  {
    stage: 'stage2',
    bpm: 130,
    track: 1,
    specialMove: app.Step.ELVIS
  },
  {
    stage: 'stage3',
    bpm: 140,
    track: 2,
    specialMove: app.Step.SPONGEBOB
  }
];

/**
 * Order of steps used for serialization.
 *
 * @const {Array.<app.Step>}
 */
app.DanceLevel.SERIALIZE_STEPS = [
  app.Step.LEFT_ARM,
  app.Step.RIGHT_ARM,
  app.Step.LEFT_FOOT,
  app.Step.RIGHT_FOOT,
  app.Step.JUMP,
  app.Step.SPLIT,
  app.Step.SHAKE
];

/**
 * Maximum number of dance steps in freestyle and shared challenges.
 *
 * @const {number}
 */
app.DanceLevel.FREESTYLE_STEP_LIMIT = 32;

/**
 * @typedef {{
 *   allowRetry: boolean,
 *   code: string,
 *   freestyle: boolean,
 *   endTitle: string,
 *   skipAnimation: boolean,
 *   animationQueue: Array.<app.AnimationItem>,
 *   overlayGraphic: string,
 *   idealBlockCount: number,
 *   isFinalLevel: boolean,
 *   missingBlocks: Array.<string>,
 *   shareUrl: string
 * }}
 */
app.DanceLevelResultOptions;

/**
 * Results form level run which can be displayed to the user.
 *
 * @param {boolean} levelComplete is true if the level was completed.
 * @param {?string} message which can be shown to the user.
 * @param {app.DanceLevelResultOptions} options for these results.
 * @constructor
 */
app.DanceLevelResult = class extends app.LevelResult {
  constructor(levelComplete, message, options) {
    options = options || {};
    super(levelComplete, message, options);
    this.animationQueue = options.animationQueue || [];
    this.danceStatus = options.danceStatus || app.DanceStatus.NO_STEPS;
    this.freestyle = options.freestyle || false;
    this.endTitle = options.endTitle;
    this.shareUrl = options.shareUrl;
  }

  watching() {
    if (this.freestyle) {
      return false;
    }

    return this.danceStatus === app.DanceStatus.NO_STEPS;
  }

  showResult() {
    return this.skipAnimation || !this.watching();
  }
};
