goog.provide('app.levels');

goog.require('app.Map');
goog.require('app.MazeLevel');
goog.require('app.PuzzleLevel');
goog.require('app.blocks');

/**
 * Array of levels.
 * @type {Array}
 */
app.levels = [];

/**
 * Create levels.
 */
app.levels.push(new app.PuzzleLevel({
  notchedEnds: false,
  numPieces: 2,
  puzzleHeight: 300,
  puzzleColor: [296, 0.492, 0.626],
  puzzleImage: 'img/puzzle-1.png',
  puzzleWidth: 200,
  startBlocks: app.blocks.blockXml('puzzle_0B') + app.blocks.blockXml('puzzle_0A')
}));

app.levels.push(new app.PuzzleLevel({
  notchedEnds: true,
  numPieces: 3,
  puzzleHeight: 300,
  puzzleColor: [171, 0.801, 0.728],
  puzzleImage: 'img/puzzle-2.png',
  puzzleWidth: 200,
  startBlocks: app.blocks.blockXml('puzzle_1C') + app.blocks.blockXml('puzzle_1B') +
      app.blocks.blockXml('puzzle_1A')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[0],
  idealBlockCount: 2,
  playerX: 1,
  playerY: 3,
  presents: [
    {x: 1, y: 1}
  ],
  requiredBlocks: ['maze_moveNorth'],
  startBlocks: app.blocks.blockXml('maze_moveNorth'),
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[1],
  idealBlockCount: 3,
  playerX: 1,
  playerY: 4,
  presents: [
    {x: 2, y: 2}
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
  playerX: 2,
  playerY: 5,
  presents: [
    {x: 3, y: 2}
  ],
  requiredBlocks: ['maze_moveNorth', 'maze_moveEast'],
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
    {x: 4, y: 1}
  ],
  requiredBlocks: ['maze_moveEast', 'maze_moveNorth', 'controls_repeat'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[5],
  idealBlockCount: 5,
  playerX: 4,
  playerY: 4,
  presents: [
    {x: 0, y: 1}
  ],
  requiredBlocks: ['maze_moveSouth', 'maze_moveWest', 'maze_moveNorth', 'controls_repeat'],
  toolbox: app.blocks.miniBlockXml('maze_moveNorth') +
      app.blocks.miniBlockXml('maze_moveSouth') +
      app.blocks.miniBlockXml('maze_moveWest') +
      app.blocks.miniBlockXml('maze_moveEast') +
      app.blocks.miniBlockXml('controls_repeat')
}));

app.levels.push(new app.MazeLevel({
  bounds: app.Map.LEVEL_BOUNDS[6],
  idealBlockCount: 5,
  playerX: 0,
  playerY: 6,
  presents: [
    {x: 4, y: 1}
  ],
  requiredBlocks: ['maze_moveNorth', 'maze_moveEast', 'controls_repeat', 'maze_moveSouth'],
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
