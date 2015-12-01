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
 * @type {!Array.<app.DanceLevel>}
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
    requiredBlocks: ['dance_pointLeft'],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
             app.blocks.miniBlockXml('dance_pointRight'),
    fadeTiles: false,
    specialMove: app.Step.CARLTON
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
    requiredBlocks: ['dance_pointLeft'],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight'),
    fadeTiles: false,
    specialMove: app.Step.CARLTON
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
    requiredBlocks: ['dance_pointLeft'],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('controls_repeat'),
    fadeTiles: true,
    specialMove: app.Step.CARLTON
  }),
  new app.DanceLevel({
    bpm: 130,
    track: 1,
    idealBlockCount: 3,
    stage: 'stage2',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM
    ],
    requiredBlocks: ['dance_pointLeft'],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('dance_jump') +
        app.blocks.miniBlockXml('dance_splits') +
        app.blocks.miniBlockXml('dance_hip') +
        app.blocks.miniBlockXml('controls_repeat'),
    fadeTiles: true,
    specialMove: app.Step.ELVIS
  }),
  new app.DanceLevel({
    bpm: 140,
    track: 2,
    idealBlockCount: 3,
    stage: 'stage3',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM
    ],
    requiredBlocks: ['dance_pointLeft'],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('dance_jump') +
        app.blocks.miniBlockXml('dance_splits') +
        app.blocks.miniBlockXml('dance_hip') +
        app.blocks.miniBlockXml('controls_repeat'),
    fadeTiles: true,
    specialMove: app.Step.SPONGEBOB
  })
);
