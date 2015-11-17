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
};

/**
 * Counts created levels so they can be given a unique id.
 * @type {number}
 */
app.Level.idCounter = 0;
