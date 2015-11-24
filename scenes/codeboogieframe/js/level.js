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

goog.provide('app.Level');
goog.provide('app.LevelResult');
goog.provide('app.LevelResultOptions');

/**
 * @typedef {{
 *   startBlocks: string,
 *   toolbox: string
 * }}
 */
app.LevelOptions;

/**
 * Base class for levels.
 *
 * @param {app.LevelOptions} options for this level.
 * @constructor
 */
app.Level = class {
  constructor(options) {
    this.startBlocks = options.startBlocks || '';
    if (!this.startBlocks.match(/^<xml/)) {
      this.startBlocks = '<xml>' + this.startBlocks + '</xml>';
    }

    this.toolbox = options.toolbox || '';
    if (!this.toolbox.match(/^<xml/)) {
      this.toolbox = '<xml>' + this.toolbox + '</xml>';
    }

    this.insertWhenRun = false;

    this.id = app.Level.idCounter++;

    this.type = null;
  }

  /**
   * Validates a blockly execution and returns a smart hint to user.
   *
   * @return {app.LevelResult} a user friendly level result.
   */
  processResult() {
  }

  get className() {
    return 'level--' + this.type + ' level--' + this.id;
  }
};

/**
 * Counts created levels so they can be given a unique id.
 * @type {number}
 */
app.Level.idCounter = 0;

/**
 * @typedef {{
 *   allowRetry: boolean,
 *   code: string,
 *   skipAnimation: boolean,
 *   overlayGraphic: string,
 *   idealBlockCount: number,
 *   isFinalLevel: boolean,
 *   missingBlocks: Array.<string>
 * }}
 */
app.LevelResultOptions;

/**
 * Results form level run which can be displayed to the user.
 *
 * @param {boolean} levelComplete is true if the level was completed.
 * @param {string=} message which can be shown to the user.
 * @param {app.LevelResultOptions=} options for these results.
 * @constructor
 */
app.LevelResult = function(levelComplete, message, options) {
  options = options || {};
  this.allowRetry = options.allowRetry == null ? true : options.allowRetry;
  this.code = options.code || null;
  this.skipAnimation = options.skipAnimation || false;
  this.overlayGraphic = options.overlayGraphic || null;
  this.levelComplete = levelComplete;
  this.isFinalLevel = options.isFinalLevel || false;
  this.message = message || '';
  this.missingBlocks = options.missingBlocks || [];

  if (options.idealBlockCount) {
    this.message = this.message.replace('{{ideal}}', options.idealBlockCount);
  }
};
