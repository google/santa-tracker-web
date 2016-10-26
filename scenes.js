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
 * @fileoverview Contains compile information for Santa Tracker's scenes. Not all scenes are
 * compiled: for instance, "about" is completely static.
 *
 * Ideally, new scenes should be type safe when compiled with Closure Compiler. If they're not,
 * mark them explicitly with `typeSafe: false`.
 */

module.exports = {
  airport: {
    typeSafe: false,
    entryPoint: 'app.Belt'
  },
  boatload: {
    entryPoint: 'app.Game'
  },
  briefing: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  callfromsanta: {
    entryPoint: 'app.Scene'
  },
  citylights: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  codeboogie: {
    typeSafe: false,
    entryPoint: 'app.FrameWrapper',
    dependencies: ['codeboogieframe']
  },
  codeboogieframe: {
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game',
    isFrame: true,
    libraries: ['third_party/lib/blockly/**/*.js']
  },
  codelab: {
    typeSafe: false,
    entryPoint: 'app.FrameWrapper',
    dependencies: ['codelabframe']
  },
  codelabframe: {
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game',
    isFrame: true,
    libraries: ['third_party/lib/blockly/**/*.js']
  },
  commandcentre: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  factory: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  glider: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  gumball: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  jamband: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  jetpack: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  latlong: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  matching: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  playground: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  postcard: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  postcardly: {
    typeSafe: true,
    entryPoint: 'app.Scene'
  },
  presentbounce: {
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  presentdrop: {
    entryPoint: 'app.Game'
  },
  press: {
    entryPoint: 'app.Scene'
  },
  mercator: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  racer: {
    entryPoint: 'app.Game'
  },
  runner: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  santasearch: {
    entryPoint: 'app.Game'
  },
  santaselfie: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  seasonofcaring: {
    typeSafe: false,
    closureLibrary: true,
    entryPoint: 'app.Game'
  },
  seasonofgiving: {
    typeSafe: false,
    closureLibrary: true,
    entryPoint: 'app.Game'
  },
  smatch: {
    entryPoint: 'app.Game'
  },
  streetview: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  traditions: {
    typeSafe: false,
    entryPoint: 'app.Traditions'
  },
  translations: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  trivia: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  windtunnel: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
};