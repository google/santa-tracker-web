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
 *   steps: app.Step[],
 *   stage: string,
 *   bpm: number,
 *   freestyle: boolean,
 *   requiredBlocks: string[]
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
    this.bpm = options.bpm;
    this.stage = options.stage || 'stage0';
    this.idealBlockCount = options.idealBlockCount || Infinity;
    this.requiredBlocks = options.requiredBlocks || [];
  }

  /**
   * Optionally creates an intro animation for when this level starts.
   *
   * @return {!app.DanceLevelResult}
   */
  introAnimation() {
    let danceStatus = app.DanceStatus.NO_STEPS;
    let animation = this.createAnimationQueue([], danceStatus);
    return new app.DanceLevelResult(false, null, {
      animationQueue: animation,
      danceStatus: danceStatus
    });
  }

  /**
   * Validates a blockly execution and returns a smart hint to user.
   *
   * @param {app.BlockEvaluation[]} playerSteps
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

    var danceStatus = this.evaluateStatus(playerSteps);
    var animationQueue = this.createAnimationQueue(playerSteps, danceStatus);
    var levelComplete = danceStatus === app.DanceStatus.SUCCESS;
    var code = blockly.getUserCode();
    var missingBlocks = blockly.getMissingBlocks(this.requiredBlocks);
    var numEnabledBlocks = blockly.getCountableBlocks().length;
    var allowRetry = true;
    var message = null;

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
    } else {
      allowRetry = false;
    }

    return new app.DanceLevelResult(levelComplete, message, {
      allowRetry: allowRetry,
      animationQueue: animationQueue,
      code: code,
      danceStatus: danceStatus,
      idealBlockCount: this.idealBlockCount,
      missingBlocks: missingBlocks
    });
  }

  /**
   * Processes the steps chosen by the player, deciding how the animation
   * should play. Will edit the step array for animation purposes in some
   * cases.
   *
   * @param {app.BlockEvaluation[]} playerSteps steps taken.
   * @return {app.DanceStatus}
   */
  evaluateStatus(playerSteps) {
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
   * @param {app.BlockEvaluation[]} playerSteps
   * @param {app.DanceStatus} result
   * @returns {app.AnimationItem[]}
   */
  createAnimationQueue(playerSteps, result) {
    let queue = [];



    playerSteps = playerSteps.filter(b => b.step);
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

    if (result === app.DanceStatus.SUCCESS) {
      queue.push({
        teacherStep: app.Step.CARLTON,
        playerStep: app.Step.CARLTON,
        title: app.I18n.getMsg('CB_success')
      });
    }

    queue.unshift({
      teacherStep: app.Step.IDLE,
      playerStep: app.Step.IDLE,
      title: app.I18n.getMsg(result === app.DanceStatus.NO_STEPS ?
          'CB_watchClosely' :
          'CB_letsDance'),
      isCountdown: true
    });

    return queue;
  }

  /**
   * Specifies css class names to apply when running this level.
   *
   * @returns {string}
   */
  className() {
    return super.className() + ' level--' + this.stage +
        (this.freestyle ? ' level--freestyle' : '');
  }
};

/**
 * @typedef {{
 *   allowRetry: boolean,
 *   code: string,
 *   skipAnimation: boolean,
 *   animationQueue: Array.<app.AnimationItem>,
 *   overlayGraphic: string,
 *   idealBlockCount: number,
 *   isFinalLevel: boolean,
 *   missingBlocks: Array.<string>
 * }}
 */
app.DanceLevelResultOptions;

/**
 * Results form level run which can be displayed to the user.
 *
 * @param {boolean} levelComplete is true if the level was completed.
 * @param {string=} message which can be shown to the user.
 * @param {app.DanceLevelResultOptions=} options for these results.
 * @constructor
 */
app.DanceLevelResult = class extends app.LevelResult {
  constructor(levelComplete, message, options) {
    options = options || {};
    super(levelComplete, message, options);
    this.animationQueue = options.animationQueue || [];
    this.danceStatus = options.danceStatus || app.DanceStatus.NO_STEPS;
  }

  watching() {
    return !this.freestyle && this.danceStatus === app.DanceStatus.NO_STEPS;
  }
};
