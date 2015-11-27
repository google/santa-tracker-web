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

goog.provide('app.levels');

goog.require('app.DanceLevel');
goog.require('app.blocks');
goog.require('app.Step');

/**
 * Array of levels.
 * @type {!Array.<!app.Level>}
 */
app.levels = [];

/**
 * Create levels.
 */
app.levels.push(
  new app.DanceLevel({
    bpm: 120,
    track: 0,
    idealBlockCount: 2,
    stage: 'stage1',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
    ],
    requiredBlocks: ['dance_leftArm'],
    toolbox: app.blocks.miniBlockXml('dance_leftArm') +
             app.blocks.miniBlockXml('dance_rightArm')
  }),
  new app.DanceLevel({
    bpm: 120,
    track: 0,
    idealBlockCount: 4,
    stage: 'stage1',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_FOOT,
      app.Step.RIGHT_FOOT
    ],
    requiredBlocks: ['dance_leftArm'],
    toolbox: app.blocks.miniBlockXml('dance_leftArm') +
        app.blocks.miniBlockXml('dance_rightArm') +
        app.blocks.miniBlockXml('dance_leftFoot') +
        app.blocks.miniBlockXml('dance_rightFoot')
  }),
  new app.DanceLevel({
    bpm: 120,
    track: 0,
    idealBlockCount: 3,
    stage: 'stage1',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM
    ],
    requiredBlocks: ['dance_leftArm'],
    toolbox: app.blocks.miniBlockXml('dance_leftArm') +
        app.blocks.miniBlockXml('dance_rightArm') +
        app.blocks.miniBlockXml('dance_leftFoot') +
        app.blocks.miniBlockXml('dance_rightFoot') +
        app.blocks.miniBlockXml('controls_repeat')
  }),
  new app.DanceLevel({
    bpm: 130,
    track: 1,
    idealBlockCount: 3,
    stage: 'stage1',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM
    ],
    requiredBlocks: ['dance_leftArm'],
    toolbox: app.blocks.miniBlockXml('dance_leftArm') +
        app.blocks.miniBlockXml('dance_rightArm') +
        app.blocks.miniBlockXml('dance_leftFoot') +
        app.blocks.miniBlockXml('dance_rightFoot') +
        app.blocks.miniBlockXml('dance_jump') +
        app.blocks.miniBlockXml('dance_split') +
        app.blocks.miniBlockXml('dance_shake') +
        app.blocks.miniBlockXml('controls_repeat')
  );
