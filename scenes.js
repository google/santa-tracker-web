/*
 * Copyright 2016 Google Inc. All rights reserved.
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

/**
 * @fileoverview Contains compile information for Santa Tracker's scenes. Only scenes marked with
 * `entryPoint` will be compiled by Closure Compiler. Scenes marked with `fanout: false` will not
 * have faux-HTML entry points created.
 *
 * Ideally, new scenes should be type safe when compiled with Closure Compiler. If they're not,
 * mark them explicitly with `typeSafe: false`.
 */

module.exports = {
  about: {
    msgid: 'about-santa'
  },
  airport: {
    msgid: 'scene_airport',
    typeSafe: false,
    entryPoint: 'app.Belt'
  },
  blimp: {
  },
  boatload: {
    msgid: 'scene_boatload',
    entryPoint: 'app.Game'
  },
  briefing: {
    msgid: 'scene_briefing',
    entryPoint: 'app.Scene'
  },
  callfromsanta: {
    msgid: 'scene_callfromsanta',
    entryPoint: 'app.Scene'
  },
  citylights: {
    msgid: 'scene_citylights',
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  codeboogie: {
    msgid: 'scene_codeboogie',
    typeSafe: false,
    entryPoint: 'app.FrameWrapper',
    dependencies: ['codeboogieframe']
  },
  codeboogieframe: {
    fanout: false,
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game',
    isFrame: true,
    libraries: ['third_party/lib/blockly/**/*.js']
  },
  codelab: {
    msgid: 'scene_codelab',
    typeSafe: false,
    entryPoint: 'app.FrameWrapper',
    dependencies: ['codelabframe']
  },
  codelabframe: {
    fanout: false,
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game',
    isFrame: true,
    libraries: ['third_party/lib/blockly/**/*.js']
  },
  commandcentre: {
    msgid: 'scene_commandcentre',
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  educators: {
    msgid: 'educators',
    dependencies: ['press']
  },
  factory: {
    msgid: 'scene_factory',
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  glider: {
    msgid: 'scene_glider',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  gumball: {
    msgid: 'scene_gumball',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  icecave: {
  },
  island: {
  },
  jamband: {
    msgid: 'scene_jamband',
    entryPoint: 'app.Game'
  },
  jetpack: {
    msgid: 'scene_jetpack',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  latlong: {
    msgid: 'scene_latlong',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  matching: {
    msgid: 'scene_matching',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  mercator: {
    msgid: 'scene_mercator',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  penguindash: {
    msgid: 'scene_dash'
  },
  playground: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  postcard: {
    msgid: 'scene_postcard',
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  presentbounce: {
    msgid: 'scene_presentbounce',
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  presentdrop: {
    msgid: 'scene_presentdrop',
    entryPoint: 'app.Game'
  },
  press: {
    msgid: 'press',
    entryPoint: 'app.Scene'
  },
  racer: {
    msgid: 'scene_racer',
    entryPoint: 'app.Game'
  },
  rollercoaster: {
  },
  runner: {
    msgid: 'scene_runner',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  santasearch: {
    msgid: 'scene_santasearch',
    entryPoint: 'app.Game'
  },
  santaselfie: {
    msgid: 'scene_santaselfie',
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  seasonofgiving: {
    msgid: 'scene_seasonofgiving',
    entryPoint: 'app.Game'
  },
  smatch: {
    entryPoint: 'app.Game'
  },
  snowflake: {
    msgid: 'scene_postcard',
    entryPoint: 'app.Scene',
    libraries: [
      'scenes/postcard/js/controls.js',
      'scenes/postcard/js/picker.js',
      'scenes/postcard/js/slider.js'
    ]
  },
  streetview: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  tracker: {
    msgid: 'tracker_track'
  },
  traditions: {
    msgid: 'scene_traditions',
    typeSafe: false,
    entryPoint: 'app.Traditions'
  },
  translations: {
    msgid: 'scene_translations',
    entryPoint: 'app.Scene'
  },
  trivia: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  undersea: {
  },
  village: {
    msgid: 'santasvillage'
  },
  windtunnel: {
    msgid: 'scene_windtunnel',
    entryPoint: 'app.Scene'
  },
  wrapbattle: {
    msgid: 'scene_wrap'
  },

// videos

  carpool: {msgid: 'scene_videoscene_carpool'},
  comroom: {},
  jingle: {},
  liftoff: {msgid: 'scene_videoscene_liftoff'},
  office: {},
  reload: {},
  santasback: {msgid: 'scene_videoscene_santasback'},
  satellite: {},
  slackingoff: {},
  temptation: {},
  tired: {},
  trailer: {},
  wheressanta: {},

};
