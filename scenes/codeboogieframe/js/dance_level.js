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

    this.steps = options.steps;
    this.idealBlockCount = options.idealBlockCount || Infinity;
    this.requiredBlocks = options.requiredBlocks || [];
  }

  /**
   * Validates a blockly execution and returns a smart hint to user.
   *
   * @param {app.Step[]} playerSteps
   * @param {!app.Blockly} blockly wrapper.
   * @return {!app.DanceLevelResult} a user friendly level result.
   */
  processResult(playerSteps, blockly) {
    // Guard for invalid results.
    if (blockly.hasEmptyContainerBlocks()) {
      // Block is assumed to be "if" or "repeat" if we reach here.
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CL_resultEmptyBlockFail'),
          {skipAnimation: true});
    }
    if (blockly.hasExtraTopBlocks()) {
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CL_resultExtraTopBlockFail'),
          {skipAnimation: true});
    }

    var danceStatus = this.compareSteps(playerSteps);
    var levelComplete = danceStatus === app.DanceStatus.SUCCESS;
    var code = blockly.getUserCode();
    var missingBlocks = blockly.getMissingBlocks(this.requiredBlocks);
    var numEnabledBlocks = blockly.getCountableBlocks().length;
    var allowRetry = true;
    var message = null;

    if (missingBlocks.length) {
      message = levelComplete ?
          app.I18n.getMsg('CL_resultMissingBlockSuccess') :
          app.I18n.getMsg('CL_resultMissingBlockFail');
    } else if (!levelComplete) {
      if (this.idealBlockCount !== Infinity &&
          numEnabledBlocks < this.idealBlockCount) {
        message = app.I18n.getMsg('CL_resultTooFewBlocksFail');
      } else {
        message = app.I18n.getMsg('CL_resultGenericFail');
      }
    } else if (numEnabledBlocks > this.idealBlockCount) {
      message = app.I18n.getMsg('CL_resultTooManyBlocksSuccess');
    } else {
      allowRetry = false;
    }

    return new app.DanceLevelResult(levelComplete, message, {
      allowRetry: allowRetry,
      code: code,
      danceStatus: danceStatus,
      idealBlockCount: this.idealBlockCount,
      missingBlocks: missingBlocks,
      playerSteps: playerSteps,
      teacherSteps: this.steps
    });
  }

  compareSteps(playerSteps) {
    let stepCount = 0;
    for (let i = 0, block = null; block = playerSteps[i]; i++) {
      // Ignore highlight only blocks
      if (!block.step) { continue; }

      if (stepCount >= this.steps.length) {
        return app.DanceStatus.TOO_MANY_STEPS;
      }
      if (block.step !== this.steps[stepCount]) {
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
};

/**
 * @typedef {{
 *   allowRetry: boolean,
 *   code: string,
 *   skipAnimation: boolean,
 *   overlayGraphic: string,
 *   idealBlockCount: number,
 *   isFinalLevel: boolean,
 *   missingBlocks: Array.<string>,
 *   playerSteps: Array.<app.Step>,
 *   teacherSteps: Array.<app.Step>
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
    this.danceStatus = options.danceStatus || app.DanceStatus.NO_STEPS;
    this.playerSteps = options.playerSteps || [];
    this.teacherSteps = options.teacherSteps || [];
  }
};
