// Extensions to Blockly's language and JavaScript generator.

goog.provide('app.blocks');

goog.require('Blockly.Blocks');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.JavaScript');
goog.require('app.I18n');
goog.require('app.Patterns');

/**
 * Utility function to create a mini block e.g. for the toolbar.
 * @param {string} type of block to create
 * @return {string} XML of block definition
 */
app.blocks.miniBlockXml = function(type) {
  return '<block type="' + type + '_mini">' +
    '<clone>' + app.blocks.blockXml(type) + '</clone>' +
    '</block>';
};

/**
 * Utility function to define a block.
 * @param {string} type of block to create
 * @param {Object.<string>} attrs map of block attributes
 * @param {Object.<string>=} fields map of field keys to values
 * @param {string} children blocks to run as DO statement.
 * @return {string} XML of block definition
 */
app.blocks.blockXml = function(type, attrs, fields, children) {
  if ('string' === typeof values) {
    children = values;
    values = null;
  }

  var xml = '<block type="' + type + '"';
  if (attrs) {
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key) && attrs[key] != null) {
        xml += ' ' + key + '="' + attrs[key] + '"';
      }
    }
  }
  xml += '>';
  if (fields) {
    for (key in fields) {
      if (fields.hasOwnProperty(key)) {
        xml += '<field name="' + key + '">' + fields[key] + '</field>';
      }
    }
  }
  if (children) {
    xml += '<statement name="DO">' + children + '</statement>';
  }
  xml += '</block>';
  return xml;
};

/**
 * Install our blocks into blockly when ready.
 */
app.blocks.install = function() {
  /**
   * Create simple move blocks
   */
  (function() {
    var DIRECTION_CONFIGS = {
      West: {
        letter: app.I18n.getMsg('CL_moveWest'),
        image: 'img/block-west.svg',
        tooltip: app.I18n.getMsg('CL_moveWestTooltip')
      },
      East: {
        letter: app.I18n.getMsg('CL_moveEast'),
        image: 'img/block-east.svg',
        tooltip: app.I18n.getMsg('CL_moveEastTooltip')
      },
      North: {
        letter: app.I18n.getMsg('CL_moveNorth'),
        image: 'img/block-north.svg',
        tooltip: app.I18n.getMsg('CL_moveNorthTooltip')
      },
      South: {
        letter: app.I18n.getMsg('CL_moveSouth'),
        image: 'img/block-south.svg',
        tooltip: app.I18n.getMsg('CL_moveSouthTooltip')
      }
    };

    var generateBlocksForDirection = function(direction) {
      Blockly.Blocks['maze_move' + direction] = generateMoveBlock(direction);
      Blockly.Blocks['maze_move' + direction + '_mini'] = generateMiniBlock(direction);
      Blockly.JavaScript['maze_move' + direction] = generateCodeGenerator(direction);
    };

    var generateMoveBlock = function(direction) {
      var directionConfig = DIRECTION_CONFIGS[direction];
      return {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.setHSV(296, 0.491, 0.624);
          this.appendDummyInput()
              .appendField(new Blockly.FieldImage(directionConfig.image, 23, 32))
              .appendField(new Blockly.FieldLabel(directionConfig.letter));
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
        }
      };
    };

    var generateMiniBlock = function(direction) {
      var directionConfig = DIRECTION_CONFIGS[direction];
      return {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.setHSV(296, 0.491, 0.624);
          this.appendDummyInput()
              .appendField(new Blockly.FieldImage(directionConfig.image, 23, 32));
          this.setMini(true);
          this.setTooltip(directionConfig.tooltip);
        }
      };
    };

    var generateCodeGenerator = function(direction) {
      return function() {
        return 'api.move' + direction + '(\'block_id_' + this.id + '\');\n';
      };
    };

    generateBlocksForDirection('North');
    generateBlocksForDirection('South');
    generateBlocksForDirection('West');
    generateBlocksForDirection('East');
  })();

  function optionNumberRange(min, max) {
    var results = [];
    for (var i = min; i <= max; i++) {
      results.push([i.toString(), i]);
    }
    return results;
  }

  /**
   * Dummy block to signal start of code.
   */
  Blockly.Blocks['when_run'] = {
    /**
     * @this {Blockly.Block}
     */
    init: function() {
      this.setHSV(26, 0.77, 0.96);
      this.appendDummyInput()
          .appendField(app.I18n.getMsg('CL_whenRun'));
      this.setNextStatement(true);
    }
  };

  Blockly.JavaScript['when_run'] = function() {
    return '\n';
  };

  Blockly.Blocks['controls_repeat'] = {
    /**
     * @this {Blockly.Block}
     */
    init: function() {
      this.setHSV(187, 1, 0.753);
      this.appendDummyInput()
          .appendField(new Blockly.FieldImage('img/block-repeat.svg', 28, 32))
          .appendField(new Blockly.FieldDropdown(optionNumberRange(2, 6)), 'TIMES')
          .appendField(app.I18n.getMsg('CL_repeatTitleTimes'));
      this.appendStatementInput('DO');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(app.I18n.getMsg('CL_repeatTooltip'));
    }
  };

  Blockly.Blocks['controls_repeat_mini'] = {
    /**
     * @this {Blockly.Block}
     */
    init: function() {
      this.setHSV(187, 1, 0.753);
      this.appendDummyInput()
          .appendField(new Blockly.FieldImage('img/block-repeat.svg', 23, 32));
      this.setMini(true);
      this.setTooltip(app.I18n.getMsg('CL_repeatTooltip'));
    }
  };

  Blockly.JavaScript['controls_repeat'] = function() {
    // Repeat n times (internal number).
    var repeats = Number(this.getFieldValue('TIMES'));
    var branch = Blockly.JavaScript.statementToCode(this, 'DO');
    if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
      branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
          '\'' + this.id + '\'') + branch;
    }
    var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
        'count', Blockly.Variables.NAME_TYPE);
    var code = 'for (var ' + loopVar + ' = 0; ' +
        loopVar + ' < ' + repeats + '; ' +
        loopVar + '++) {\n' +
        branch + '}\n';
    return code;
  };

  app.levels.forEach(function(level) {
    if (level.type !== 'puzzle') {
      return;
    }
    generateJigsawBlocksForLevel({
      image: level.puzzleImage,
      HSV: level.puzzleColor,
      width: level.puzzleWidth,
      height: level.puzzleHeight,
      numBlocks: level.numPieces,
      notchedEnds: level.notchedEnds,
      level: level.id
    });
  });

  function generateJigsawBlocksForLevel(options) {
    var image = options.image;
    var width = options.width;
    var height = options.height;
    var numBlocks = options.numBlocks;
    var level = options.level;
    var HSV = options.HSV;
    // if true, first/last block will still have previous/next notches
    var notchedEnds = options.notchedEnds;

    var blockHeight = height / numBlocks;
    var titleWidth = width - 54;
    var titleHeight = blockHeight - 10;

    var letters = '-ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function generateBlock(blockNum) {
      var blockName = 'puzzle_' + level + letters[blockNum];
      var patternName = 'pat_' + level + letters[blockNum];
      Blockly.Blocks[blockName] = {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.setHSV.apply(this, HSV);
          this.appendDummyInput()
            .appendField(new Blockly.FieldImage('img/blank.png', titleWidth, titleHeight));
          this.setPreviousStatement(blockNum !== 1 || notchedEnds);
          this.setNextStatement(blockNum !== numBlocks || notchedEnds);
          this.setFillPattern(
            app.Patterns.addPattern(patternName, image, width, height, 0,
              blockHeight * (blockNum - 1)));
        }
      };
    }

    for (var i = 1; i <= numBlocks; i++) {
      generateBlock(i);
    }
  }
};
