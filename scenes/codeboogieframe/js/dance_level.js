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
goog.provide('app.DanceLevelResult');
goog.require('app.Level');

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
    var levelComplete = goog.array.equals(playerSteps, this.steps);
    var message;
    if (blockly.hasEmptyContainerBlocks()) {
      // Block is assumed to be "if" or "repeat" if we reach here.
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CL_resultEmptyBlockFail'),
          {doNotAnimate: true});
    }
    if (blockly.hasExtraTopBlocks()) {
      return new app.DanceLevelResult(false,
          app.I18n.getMsg('CL_resultExtraTopBlockFail'),
          {doNotAnimate: true});
    }

    var code = blockly.getUserCode();
    var missingBlocks = blockly.getMissingBlocks(this.requiredBlocks);
    if (missingBlocks.length) {
      message = levelComplete ?
          app.I18n.getMsg('CL_resultMissingBlockSuccess') :
          app.I18n.getMsg('CL_resultMissingBlockFail');
      return new app.DanceLevelResult(levelComplete, message, {
        code: code,
        idealBlockCount: this.idealBlockCount,
        missingBlocks: missingBlocks
      });
    }
    var numEnabledBlocks = blockly.getCountableBlocks().length;
    if (!levelComplete) {
      if (this.idealBlockCount !== Infinity &&
          numEnabledBlocks < this.idealBlockCount) {
        return new app.DanceLevelResult(levelComplete,
            app.I18n.getMsg('CL_resultTooFewBlocksFail'),
            {code: code, idealBlockCount: this.idealBlockCount});
      }
      return new app.DanceLevelResult(levelComplete,
          app.I18n.getMsg('CL_resultGenericFail', {code: code}));
    }
    if (numEnabledBlocks > this.idealBlockCount) {
      return new app.DanceLevelResult(levelComplete,
          app.I18n.getMsg('CL_resultTooManyBlocksSuccess'),
          {code: code, idealBlockCount: this.idealBlockCount});
    } else {
      return new app.DanceLevelResult(levelComplete, null, {
        allowRetry: false,
        code: code
      });
    }
  }
};

/**
 * @typedef {{
 *   allowRetry: boolean,
 *   code: string,
 *   doNotAnimate: boolean,
 *   graphic: string,
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
app.DanceLevelResult = class {
  constructor(levelComplete, message, options) {
    options = options || {};
    this.allowRetry = options.allowRetry == null ? true : options.allowRetry;
    this.code = options.code || null;
    this.doNotAnimate = options.doNotAnimate || false;
    this.graphic = options.graphic || null;
    this.levelComplete = levelComplete;
    this.isFinalLevel = options.isFinalLevel || false;
    this.message = message || '';
    this.missingBlocks = options.missingBlocks || [];

    if (options.idealBlockCount) {
      this.message = this.message.replace('{{ideal}}', options.idealBlockCount);
    }
  }
};
