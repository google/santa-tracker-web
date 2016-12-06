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
goog.provide('app.extraLevels');

goog.require('app.Map');
goog.require('app.MazeLevel');
goog.require('app.PuzzleLevel');
goog.require('app.blocks');

/**
 * Array of levels.
 * @type {!Array.<!app.PuzzleLevel>}
 */
app.levels = [];

/**
 * Array of levels.
 * @type {!Array.<!app.PuzzleLevel>}
 */
app.extraLevels = [];

/**
 * Create levels. If you add or remove levels, be sure to adjust the total number of levels
 * specified inside `codelab/js/constants.js` (i.e., the non-frame page).
 */
app.levels.push(new app.PuzzleLevel({
  notchedEnds: false,
  numPieces: 2,
  puzzleHeight: 300,
  puzzleColor: [296, 0.492, 0.626],
  puzzleImage: 'img/puzzle-1.png',
  puzzleWidth: 200,
  startBlocks: app.blocks.blockXml('puzzle_0B', {height: 150}) +
      app.blocks.blockXml('puzzle_0A', {height: 150})
}));

app.levels.push(new app.PuzzleLevel({
  notchedEnds: true,
  numPieces: 3,
  puzzleHeight: 300,
  puzzleColor: [171, 0.801, 0.728],
  puzzleImage: 'img/puzzle-2.png',
  puzzleWidth: 200,
  startBlocks: app.blocks.blockXml('puzzle_1C', {height: 100}) +
      app.blocks.blockXml('puzzle_1B', {height: 100}) +
      app.blocks.blockXml('puzzle_1A', {height: 100})
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[0],
  idealBlockCount: 2,
  playerX: 3,
  playerY: 3,
  presents: [
    {x: 3, y: 1}
  ],
  requiredBlocks: ['maze_moveNorth'],
  startBlocks: app.blocks.blockXml('maze_moveNorth', {deletable: false}),
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[1],
  idealBlockCount: 3,
  playerX: 3,
  playerY: 4,
  presents: [
    {x: 4, y: 2}
  ],
  requiredBlocks: ['maze_moveNorth', 'maze_moveEast'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[2],
  idealBlockCount: 4,
  playerX: 4,
  playerY: 5,
  presents: [
    {x: 3, y: 2}
  ],
  requiredBlocks: ['maze_moveNorth', 'maze_moveWest'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[3],
  idealBlockCount: 2,
  playerX: 3,
  playerY: 6,
  presents: [
    {x: 3, y: 1}
  ],
  requiredBlocks: ['controls_repeat', 'maze_moveNorth'],
  startBlocks: app.blocks.blockXml('controls_repeat', null, {TIMES: '3'},
                                   app.blocks.blockXml('maze_moveNorth')),
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[4],
  idealBlockCount: 3,
  playerX: 3,
  playerY: 7,
  presents: [
    {x: 2, y: 1}
  ],
  requiredBlocks: ['maze_moveWest', 'maze_moveNorth', 'controls_repeat'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[5],
  idealBlockCount: 5,
  playerX: 2,
  playerY: 4,
  presents: [
    {x: 5, y: 1}
  ],
  requiredBlocks: ['maze_moveSouth', 'maze_moveEast', 'maze_moveNorth', 'controls_repeat'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[6],
  idealBlockCount: 8,
  playerX: 5,
  playerY: 6,
  presents: [
    {x: 4, y: 1}
  ],
  requiredBlocks: ['maze_moveNorth', 'maze_moveEast', 'controls_repeat', 'maze_moveWest'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[7],
  idealBlockCount: 5,
  playerX: 4,
  playerY: 8,
  presents: [
    {x: 0, y: 4}
  ],
  requiredBlocks: ['maze_moveNorth', 'maze_moveWest', 'controls_repeat'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.extraLevels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[8],
  idealBlockCount: 1,
  playerX: 2,
  playerY: 5,
  presents: [
    {x: 2, y: 3}
  ],
  requiredBlocks: ['controls_jump'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_jump')
}));

app.extraLevels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[9],
  idealBlockCount: 2,
  playerX: 2,
  playerY: 5,
  presents: [
    {x: 3, y: 2}
  ],
  requiredBlocks: ['controls_jump', 'maze_moveEast'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_jump')
}));

app.extraLevels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[10],
  idealBlockCount: 1,
  playerX: 3,
  playerY: 5,
  presents: [
    {x: 3, y: 2}
  ],
  requiredBlocks: ['controls_jump'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_jump')
}));

app.extraLevels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[11],
  idealBlockCount: 2,
  playerX: 3,
  playerY: 8,
  presents: [
    {x: 3, y: 2}
  ],
  requiredBlocks: ['controls_jump', 'controls_repeat'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat') +
      app.blocks.miniBlockXml('controls_jump')
}));
