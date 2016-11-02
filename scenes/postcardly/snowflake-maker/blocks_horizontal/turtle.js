/**
 * Blockly Games: Turtle Blocks
 *
 * Copyright 2012 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for Blockly's Turtle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

//TODO(madCode): rename Turtle to Snowflake

goog.provide('Turtle.Blocks');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');

// Extensions to Blockly's language and JavaScript generator.
Blockly.Blocks['snowflake_start'] = {
  init: function() {
    this.jsonInit({
      "id": "snowflake_start",
      "message0": "%1",
      "args0": [
	{
	  "type": "field_image",
	  "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_snowflake.png",
	  "width": 40,
	  "height": 40,
	  "alt": "snowflake",
          "flip_rtl": false
        }
      ],
	"nextStatement": "SnowflakeStarter",
        "inputsInline": true,
        "category": Blockly.Categories.turtle,
        "colour": Blockly.Colours.control.primary,
        "colourSecondary": Blockly.Colours.control.secondary,
        "colourTertiary": Blockly.Colours.control.tertiary
      });
    }
};

Blockly.JavaScript['snowflake_start'] = function(block) {
  return '';
};

Blockly.Blocks['copy_to_make_snowflake'] = {
    init: function() {
      this.jsonInit({
        "id": "copy_to_make_snowflake",
        "message0": "%1 %2",
        "args0": [
          {
            "type": "input_statement",
            "name": "SUBSTACK"
          },
          {
            "type": "field_image",
            "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_snowflake.png",
            "width": 40,
            "height": 40,
            "alt": "snowflake",
            "flip_rtl": false
          }
        ],
	"previousConnection": "SnowflakeStarter",
        "inputsInline": true,
        "category": Blockly.Categories.turtle,
        "colour": Blockly.Colours.control.primary,
        "colourSecondary": Blockly.Colours.control.secondary,
        "colourTertiary": Blockly.Colours.control.tertiary
      });
    }
};

Blockly.JavaScript['copy_to_make_snowflake'] = function(block) {
  // Repeat 6 times and rotate around in a circle to create a snowflake effect.
  var branch = Blockly.JavaScript.statementToCode(block, 'SUBSTACK');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
  var code = '';
  var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  code += 'for (var ' + loopVar + ' = 0; ' +
      loopVar + ' <  6; ' +
      loopVar + '++) {\n' +
      branch + 'reset(); turnRight(60*(' + loopVar + '+1), \'block_id_' + block.id + '\');}\n';
  return code;
};

//TODO(madCode): convert these to json format
Blockly.Blocks['turtle_move_forward'] = {
  /**
   * Block for moving forward.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "turtle_move_forward",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "VALUE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_forward.png",
          "width": 40,
          "height": 40,
          "alt": "move forward",
          "flip_rtl": false
        }
      ],
      "previousStatement": "Draw",
      "nextStatement": "Draw",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['turtle_move_forward'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'moveForward' +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_move_backward'] = {
  /**
   * Block for moving forward.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "turtle_move_backward",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "VALUE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_back.png",
          "width": 40,
          "height": 40,
          "alt": "move backward",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['turtle_move_backward'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'moveBackward' +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

//TODO(madCode): can we delete the internal blocks or are they used for something?
Blockly.Blocks['turtle_move_internal'] = {
  /**
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [['SOME_MESSAGE', 'moveForward'],
         ['SOME_MESSAGE', 'moveBackward']];
    var VALUES =
        [['20', '20'],
         ['50', '50'],
         ['100', '100'],
         ['150', '150']];
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
        .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('SOME_MESSAGE');
  }
};

Blockly.Blocks['turtle_turn_left'] = {
  /**
   * Block for turning left.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "turtle_turn_left",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "VALUE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_ccw.png",
          "width": 40,
          "height": 40,
          "alt": "turn left",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['turtle_turn_left'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'turnLeft' +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_turn_right'] = {
  /**
   * Block for turning right.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "turtle_turn_right",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "VALUE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_cw.png",
          "width": 40,
          "height": 40,
          "alt": "turn right",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['turtle_turn_right'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'turnRight' +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

//TODO(madCode): delete once confirmed we won't need it.
Blockly.Blocks['triangle_draw'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_triangle.png", 40, 40, "draw shape outline"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['triangle_draw'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return Blockly.Blocks.drawTriangle(size, 'block_id_' + block.id);
};

Blockly.Blocks.drawTriangle = function(size, id) {
  return 'turnLeft(90,\'' + id + '\');\n moveForwardAndDraw(' + size/2 + ',\'' + id + '\');\n ' +
  'turnRight(120,\'' + id + '\');\n moveForwardAndDraw(' + size + ',\'' + id + '\');\n ' +
  'turnRight(120,\'' + id + '\');\n moveForwardAndDraw(' + size + ',\'' + id + '\');\n ' +
  'turnRight(120,\'' + id + '\');\n moveForwardAndDraw(' + size/2 + ',\'' + id + '\');\n ' +
  'turnRight(90,\'' + id + '\');\n';
};

Blockly.Blocks['square_stamp'] = {
  /**
   * Block for stamping the outline of a sqare.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "square_stamp",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "SIZE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_square.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a square",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['square_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampSquare(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['pentagon_stamp'] = {
  /**
   * Block for stamping the outline of a pentagon.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "pentagon_stamp",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "SIZE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_pentagram.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a pentagon",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['pentagon_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampPentagon(' + size + ', \'block_id_' + block.id + '\');\n';
};


Blockly.Blocks['triangle_stamp'] = {
  /**
   * Block for stamping the outline of a triangle.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "triangle_stamp",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "SIZE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_triangle.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a triangle",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['triangle_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampTriangle(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['diamond_stamp'] = {
  /**
   * Block for stamping the outline of a diamond.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "diamon_stamp",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "SIZE"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/ic_block_diamond.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a diamond",
          "flip_rtl": false
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['diamond_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampDiamond(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['dropdown_turtle_pen'] = {
  /**
   * Block for set color drop-down (used for shadow).
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/pen.svg",
              value: 'penUp', width: 48, height: 48, alt: 'Pen Up'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/pen.svg",
              value: 'penDown', width: 48, height: 48, alt: 'Pen Down'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.looks.secondary,
      Blockly.Colours.looks.tertiary
    );
  }
};

Blockly.Blocks['turtle_pen'] = {
  /**
   * Block for pen up/down.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/pen.svg",
          "width": 40,
          "height": 40,
          "alt": "pen icon",
          "flip_rtl": true
        },
        {
          "type": "input_value",
          "name": "CHOICE",
        }
      ],
      //"inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
    });
  }
};

Blockly.JavaScript['turtle_pen'] = function(block) {
  // Generate JavaScript for pen up/down.
  return block.getInput('CHOICE').connection.targetBlock().getFieldValue('CHOICE') +
      '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_colour'] = {
  /**
   * Block for setting the colour.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/pen.svg", 40, 40, "pen icon"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('SOME_MESSAGE');
  }
};

Blockly.JavaScript['turtle_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ', \'block_id_' +
      block.id + '\');\n';
};
