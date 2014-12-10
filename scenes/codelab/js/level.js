goog.provide('app.Level');
goog.provide('app.LevelResult');
goog.provide('app.MazeLevel');
goog.provide('app.PuzzleLevel');

/**
 * @typedef {{
 *   startBlocks: string,
 *   toolbox: string
 * }}
 */
app.LevelOptions;

/**
 * Base class for levels.
 * @param {app.LevelOptions} options for this level.
 * @constructor
 */
app.Level = function(options) {
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
};

/**
 * Counts created levels so they can be given a unique id.
 * @type {number}
 */
app.Level.idCounter = 0;


/**
 * @typedef {{
 *   startBlocks: string,
 *   toolbox: string,
 *   notchedEnds: boolean,
 *   numPieces: number,
 *   puzzleColor: Array.<number>,
 *   puzzleHeight: number,
 *   puzzleImage: string,
 *   puzzleWidth: number
 * }}
 */
app.PuzzleLevelOptions;

/**
 * A jigsaw style level where the goal is to solve a simple puzzle using blocks.
 * @param {app.PuzzleLevelOptions} options for this level.
 * @constructor
 */
app.PuzzleLevel = function(options) {
  app.Level.call(this, options);
  this.insertWhenRun = false;
  this.type = 'puzzle';

  this.notchedEnds = options.notchedEnds;
  this.numPieces = options.numPieces;
  this.puzzleColor = options.puzzleColor;
  this.puzzleHeight = options.puzzleHeight;
  this.puzzleImage = options.puzzleImage;
  this.puzzleWidth = options.puzzleWidth;
};
goog.inherits(app.PuzzleLevel, app.Level);

/**
 * Validates whether the puzzle has been successfully put together.
 * @return {boolean} true if the puzzle is correctly assembled.
 */
app.PuzzleLevel.prototype.checkSuccess = function() {
  var letters = '-ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var id = this.id;
  var numBlocks = this.numPieces;

  var types = [];
  for (var i = 1; i <= numBlocks; i++) {
    types.push('puzzle_' + id + letters[i]);
  }

  var roots = Blockly.mainWorkspace.getTopBlocks();
  if (roots.length !== 1) {
    return false;
  }

  var depth = 0;
  var block = roots[0];
  while (depth < numBlocks) {
    if (!block || block.type !== types[depth]) {
      return false;
    }
    var children = block.getChildren();
    if (children.length > 1) {
      return false;
    }
    block = children[0];
    depth++;
  }

  // last block shouldnt have children
  if (block !== undefined) {
    return false;
  }

  return true;
};


/**
 * @typedef {{
 *   startBlocks: string,
 *   toolbox: string,
 *   bounds: number,
 *   idealBlockCount: number,
 *   playerX: number,
 *   playerY: number,
 *   presents: Array.<{x: number, y: number}>,
 *   requiredBlocks: Array.<string>
 * }}
 */
app.MazeLevelOptions;

/**
 * A maze level where the goal is to navigate a player through a maze.
 * @param {app.MazeLevelOptions} options for this level.
 * @constructor
 */
app.MazeLevel = function(options) {
  app.Level.call(this, options);

  this.insertWhenRun = true;

  this.type = 'maze';

  this.idealBlockCount = options.idealBlockCount || Infinity;
  this.minY = options.bounds;
  this.maxY = this.minY + app.Constants.LEVEL_USABLE_ROWS;
  this.playerX = options.playerX;
  this.playerY = this.minY + options.playerY;
  this.presents = (options.presents || []).map(function(p) {
    return {
      x: p.x,
      y: options.bounds + p.y
    };
  });
  this.requiredBlocks = options.requiredBlocks || [];
};
goog.inherits(app.MazeLevel, app.Level);

/**
 * Checks if a specific tile is outside the bounds of the map.
 * @param {number} x position.
 * @param {number} y position.
 * @return {boolean} true if x and y denote an illegal tile.
 */
app.MazeLevel.prototype.isOutsideBounds = function(x, y) {
  return x < 0 || x >= app.Constants.LEVEL_USABLE_MAX_COLS ||
    y < this.minY || y >= this.maxY;
};

/**
 * Validates a blockly execution and returns a smart hint to user.
 * @param {boolean} levelComplete if code successfully finished level.
 * @param {app.Blockly} blockly wrapper.
 * @return {app.LevelResult} a user friendly level result.
 */
app.MazeLevel.prototype.processResult = function(levelComplete, blockly) {
  var message;
  if (blockly.hasEmptyContainerBlocks()) {
    // Block is assumed to be "if" or "repeat" if we reach here.
    return new app.LevelResult(false, app.I18n.getMsg('CL_resultEmptyBlockFail'), {
      doNotAnimate: true
    });
  }
  if (blockly.hasExtraTopBlocks()) {
    return new app.LevelResult(false, app.I18n.getMsg('CL_resultExtraTopBlockFail'), {
      doNotAnimate: true
    });
  }

  var code = blockly.getUserCode();
  var missingBlocks = blockly.getMissingBlocks(this.requiredBlocks);
  if (missingBlocks.length) {
    message = levelComplete ?
        app.I18n.getMsg('CL_resultMissingBlockSuccess') :
        app.I18n.getMsg('CL_resultMissingBlockFail');
    return new app.LevelResult(levelComplete, message, {
      code: code,
      idealBlockCount: this.idealBlockCount,
      missingBlocks: missingBlocks
    });
  }
  var numEnabledBlocks = blockly.getCountableBlocks().length;
  if (!levelComplete) {
    if (this.idealBlockCount !== Infinity && numEnabledBlocks < this.idealBlockCount) {
      return new app.LevelResult(levelComplete, app.I18n.getMsg('CL_resultTooFewBlocksFail'), {
        code: code,
        idealBlockCount: this.idealBlockCount
      });
    }
    return new app.LevelResult(levelComplete, app.I18n.getMsg('CL_resultGenericFail', {
      code: code
    }));
  }
  if (numEnabledBlocks > this.idealBlockCount) {
    return new app.LevelResult(levelComplete, app.I18n.getMsg('CL_resultTooManyBlocksSuccess'), {
      code: code,
      idealBlockCount: this.idealBlockCount
    });
  } else {
    return new app.LevelResult(levelComplete, null, {
      allowRetry: false,
      code: code
    });
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
app.LevelResultOptions;

/**
 * Results form level run which can be displayed to the user.
 * @param {boolean} levelComplete is true if the level was completed.
 * @param {string=} message which can be shown to the user.
 * @param {app.LevelResultOptions=} options for these results.
 * @constructor
 */
app.LevelResult = function(levelComplete, message, options) {
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
};
