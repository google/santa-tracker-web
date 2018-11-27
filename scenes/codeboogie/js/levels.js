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

goog.provide('app.Levels');
goog.provide('app.freestyleLevel');

goog.require('app.DanceLevel');
goog.require('app.blocks');
goog.require('app.Step');

/**
 * Array of levels.
 * @type {!Array.<app.DanceLevel>}
 */
app.Levels = {
  getDanceClasses: () => danceClasses,

  createFreestyleLevel(stage) {
    const stages = {
      'studio': {
        stage: 'stage1',
        track: 0,
        bpm: 120
      },
      'stage': {
        stage: 'stage2',
        track: 1,
        bpm: 130
      },
      'disco': {
        stage: 'stage3',
        track: 2,
        bpm: 140
      }
    };

    let stageData = stages[stage];

    return [
      new app.DanceLevel({
        freestyle: true,
        bpm: stageData.bpm,
        track: stageData.track,
        idealBlockCount: Infinity,
        stage: stageData.stage,
        steps: [],
        toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('dance_jump') +
        app.blocks.miniBlockXml('dance_splits') +
        app.blocks.miniBlockXml('dance_hip') +
        app.blocks.miniBlockXml('controls_repeat'),
        specialMove: app.Step.SPONGEBOB
      })
    ];
  }
};

/**
 * Dance classes.
 */
const danceClasses = [
  new app.DanceLevel({
    bpm: 120,
    track: 0,
    idealBlockCount: 2,
    longerIntro: true,
    stage: 'stage1',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM
    ],
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
    idealBlockCount: 6,
    stage: 'stage1',
    steps: [
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_FOOT,
      app.Step.RIGHT_FOOT,
      app.Step.LEFT_FOOT,
      app.Step.RIGHT_FOOT
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.CARLTON,
    startBlocks: app.blocks.blockXml('controls_repeat', null, {TIMES: '2'},
        app.blocks.blockXml('dance_pointLeft', null, null, null,
            app.blocks.blockXml('dance_pointRight')
        )
    )
  }),

  new app.DanceLevel({
    bpm: 130,
    track: 1,
    idealBlockCount: 5,
    longerIntro: true,
    stage: 'stage2',
    steps: [
      app.Step.JUMP,
      app.Step.LEFT_ARM,
      app.Step.JUMP,
      app.Step.RIGHT_ARM,
      app.Step.JUMP,
      app.Step.LEFT_ARM,
      app.Step.JUMP,
      app.Step.RIGHT_ARM
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('dance_jump') +
        app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.ELVIS
  }),

  new app.DanceLevel({
    bpm: 130,
    track: 1,
    idealBlockCount: 5,
    stage: 'stage2',
    steps: [
      app.Step.JUMP,
      app.Step.RIGHT_FOOT,
      app.Step.LEFT_ARM,
      app.Step.LEFT_FOOT,
      app.Step.JUMP,
      app.Step.RIGHT_FOOT,
      app.Step.LEFT_ARM,
      app.Step.LEFT_FOOT
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
    app.blocks.miniBlockXml('dance_pointRight') +
    app.blocks.miniBlockXml('dance_stepLeft') +
    app.blocks.miniBlockXml('dance_stepRight') +
    app.blocks.miniBlockXml('dance_jump') +
    app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.ELVIS
  }),

  new app.DanceLevel({
    bpm: 130,
    track: 1,
    idealBlockCount: 7,
    stage: 'stage2',
    steps: [
      app.Step.JUMP,
      app.Step.SPLIT,
      app.Step.JUMP,
      app.Step.SPLIT,
      app.Step.RIGHT_FOOT,
      app.Step.LEFT_ARM,
      app.Step.JUMP,
      app.Step.SPLIT
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
    app.blocks.miniBlockXml('dance_pointRight') +
    app.blocks.miniBlockXml('dance_stepLeft') +
    app.blocks.miniBlockXml('dance_stepRight') +
    app.blocks.miniBlockXml('dance_jump') +
    app.blocks.miniBlockXml('dance_splits') +
    app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.ELVIS
  }),

  new app.DanceLevel({
    bpm: 140,
    track: 2,
    idealBlockCount: 6,
    longerIntro: true,
    stage: 'stage3',
    steps: [
      app.Step.SHAKE,
      app.Step.SHAKE,
      app.Step.SHAKE,
      app.Step.SHAKE,
      app.Step.JUMP,
      app.Step.RIGHT_FOOT,
      app.Step.LEFT_FOOT,
      app.Step.SHAKE
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
        app.blocks.miniBlockXml('dance_pointRight') +
        app.blocks.miniBlockXml('dance_stepLeft') +
        app.blocks.miniBlockXml('dance_stepRight') +
        app.blocks.miniBlockXml('dance_jump') +
        app.blocks.miniBlockXml('dance_splits') +
        app.blocks.miniBlockXml('dance_hip') +
        app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.SPONGEBOB
  }),

  new app.DanceLevel({
    bpm: 140,
    track: 2,
    idealBlockCount: 8,
    stage: 'stage3',
    steps: [
      app.Step.RIGHT_FOOT,
      app.Step.JUMP,
      app.Step.SHAKE,
      app.Step.LEFT_ARM,
      app.Step.LEFT_FOOT,
      app.Step.JUMP,
      app.Step.SPLIT,
      app.Step.RIGHT_ARM
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
    app.blocks.miniBlockXml('dance_pointRight') +
    app.blocks.miniBlockXml('dance_stepLeft') +
    app.blocks.miniBlockXml('dance_stepRight') +
    app.blocks.miniBlockXml('dance_jump') +
    app.blocks.miniBlockXml('dance_splits') +
    app.blocks.miniBlockXml('dance_hip') +
    app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.SPONGEBOB
  }),

  new app.DanceLevel({
    bpm: 140,
    track: 2,
    idealBlockCount: 10,
    stage: 'stage3',
    steps: [
      app.Step.SHAKE,
      app.Step.LEFT_FOOT,
      app.Step.JUMP,
      app.Step.RIGHT_FOOT,

      app.Step.SHAKE,
      app.Step.LEFT_FOOT,
      app.Step.JUMP,
      app.Step.RIGHT_FOOT,

      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,

      app.Step.LEFT_ARM,
      app.Step.RIGHT_ARM,
      app.Step.JUMP,
      app.Step.SPLIT
    ],
    toolbox: app.blocks.miniBlockXml('dance_pointLeft') +
    app.blocks.miniBlockXml('dance_pointRight') +
    app.blocks.miniBlockXml('dance_stepLeft') +
    app.blocks.miniBlockXml('dance_stepRight') +
    app.blocks.miniBlockXml('dance_jump') +
    app.blocks.miniBlockXml('dance_splits') +
    app.blocks.miniBlockXml('dance_hip') +
    app.blocks.miniBlockXml('controls_repeat'),
    specialMove: app.Step.SPONGEBOB
  })
];
