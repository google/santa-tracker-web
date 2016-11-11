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
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_snowflake.png",
          "width": 40,
          "height": 40,
          "alt": "snowflake",
          "flip_rtl": false
        }
      ],
      "nextStatement": "Start",
      "inputsInline": true,
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.primary,
      "colourTertiary": Blockly.Colours.control.primary
    });
  }
};

Blockly.JavaScript['snowflake_start'] = function(block) {
  return 'setOnRepeat(false);\n';
};

Blockly.Blocks['copy_to_make_snowflake'] = {
    init: function() {
      this.jsonInit({
        "id": "copy_to_make_snowflake",
        "message0": "%1 %2",
        "args0": [
          {
	    "type": "input_statement",
	    "name": "SUBSTACK",
	    "check": "Stamp",
          },
          {
            "type": "field_image",
            "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_loopx6.png",
            "width": 40,
            "height": 40,
            "alt": "snowflake",
            "flip_rtl": false
          }
        ],
        "previousStatement": "Start",
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
  // Pausing for 50% longer than normal to denote that this is no longer the user's code.
  code += 'for (var ' + loopVar + ' = 0; ' +
      loopVar + ' <  6; ' +
      loopVar + '++) {\n' +
      branch + 'if(' +
      loopVar + ' == 0){\n pause(' +
      1.5 * 1000 * Math.pow(1 - 0.3, 2) +
      ');\n }\n reset();\n turnRight(60*(' +
      loopVar + '+1), \'block_id_' +
      block.id + '\');\n setOnRepeat(true);\n}\n';
  return code;
};

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
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_forward.png",
          "width": 40,
          "height": 40,
          "alt": "move forward",
          "flip_rtl": false
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['dropdown_move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_forward_sm.png",
              value: '10', width: 48, height: 48, alt: 'move 10'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_forward_med.png",
              value: '20', width: 48, height: 48, alt: 'move 20'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_forward_lg.png",
              value: '30', width: 48, height: 48, alt: 'move 30'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
};

Blockly.JavaScript['turtle_move_forward'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = block.getInput('VALUE').connection.targetBlock().getFieldValue('CHOICE');
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
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_back.png",
          "width": 40,
          "height": 40,
          "alt": "move backward",
          "flip_rtl": false
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['dropdown_move_backward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_back_sm.png",
              value: '10', width: 48, height: 48, alt: 'move 10'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_back_med.png",
              value: '20', width: 48, height: 48, alt: 'move 20'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_back_lg.png",
              value: '30', width: 48, height: 48, alt: 'move 30'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
};

Blockly.JavaScript['turtle_move_backward'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = block.getInput('VALUE').connection.targetBlock().getFieldValue('CHOICE');
  return 'moveBackward' +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
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
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw.png",
          "width": 40,
          "height": 40,
          "alt": "turn left",
          "flip_rtl": false
        },
        {
          "type": "input_value",
          "name": "ANGLE"
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['dropdown_turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_030.png",
              value: '30', width: 48, height: 48, alt: '30'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_060.png",
              value: '60', width: 48, height: 48, alt: '60'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_090.png",
              value: '90', width: 48, height: 48, alt: '90'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_120.png",
              value: '120', width: 48, height: 48, alt: '120'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_150.png",
              value: '150', width: 48, height: 48, alt: '150'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_180.png",
              value: '180', width: 48, height: 48, alt: '180'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
};

Blockly.JavaScript['turtle_turn_left'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = block.getInput('ANGLE').connection.targetBlock().getFieldValue('CHOICE');
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
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw.png",
          "width": 40,
          "height": 40,
          "alt": "turn right",
          "flip_rtl": false
        },
        {
          "type": "input_value",
          "name": "ANGLE"
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['dropdown_turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw_030.png",
              value: '30', width: 48, height: 48, alt: '30'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw_060.png",
              value: '60', width: 48, height: 48, alt: '60'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw_090.png",
              value: '90', width: 48, height: 48, alt: '90'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw_120.png",
              value: '120', width: 48, height: 48, alt: '120'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw_150.png",
              value: '150', width: 48, height: 48, alt: '150'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw_180.png",
              value: '180', width: 48, height: 48, alt: '180'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
};

Blockly.JavaScript['turtle_turn_right'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = block.getInput('ANGLE').connection.targetBlock().getFieldValue('CHOICE');
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
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle.png", 40, 40, "draw shape outline"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['triangle_draw'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = block.getInput('SIZE').connection.targetBlock().getFieldValue('CHOICE');
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
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a square",
          "flip_rtl": false
        },
        {
          "type": "input_value",
          "name": "SIZE"
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['square_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = block.getInput('SIZE').connection.targetBlock().getFieldValue('CHOICE');
  return 'stampSquare(' + size + ', \'block_id_' + block.id + '\');\n';
};

//25, 55, 85, 115, 145, 175
Blockly.Blocks['dropdown_square'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square_1.png",
              value: '25', width: 48, height: 48, alt: '25'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square_2.png",
              value: '45', width: 48, height: 48, alt: '45'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square_3.png",
              value: '65', width: 48, height: 48, alt: '65'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square_4.png",
              value: '85', width: 48, height: 48, alt: '85'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square_5.png",
              value: '105', width: 48, height: 48, alt: '105'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_square_6.png",
              value: '125', width: 48, height: 48, alt: '125'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
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
          "name": "SIZE",
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a pentagon",
          "flip_rtl": false
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['dropdown_pentagon'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_1.png",
              value: '25', width: 48, height: 48, alt: '25'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_2.png",
              value: '45', width: 48, height: 48, alt: '45'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_3.png",
              value: '65', width: 48, height: 48, alt: '65'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_4.png",
              value: '85', width: 48, height: 48, alt: '85'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_5.png",
              value: '105', width: 48, height: 48, alt: '105'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_6.png",
              value: '125', width: 48, height: 48, alt: '125'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
};

Blockly.JavaScript['pentagon_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = block.getInput('SIZE').connection.targetBlock().getFieldValue('CHOICE');
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
	  "name": "SIZE",
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a triangle",
          "flip_rtl": false
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['dropdown_triangle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle_1.png",
              value: '25', width: 48, height: 48, alt: '25'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle_2.png",
              value: '45', width: 48, height: 48, alt: '45'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle_3.png",
              value: '65', width: 48, height: 48, alt: '65'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle_4.png",
              value: '85', width: 48, height: 48, alt: '85'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle_5.png",
              value: '105', width: 48, height: 48, alt: '105'},
          {src: Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_triangle_6.png",
              value: '125', width: 48, height: 48, alt: '125'},
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Blockly.Colours.pen.primary,
      Blockly.Colours.pen.secondary,
      Blockly.Colours.pen.tertiary
    );
  }
};

Blockly.JavaScript['triangle_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = block.getInput('SIZE').connection.targetBlock().getFieldValue('CHOICE');
  return 'stampTriangle(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['diamond_stamp'] = {
  /**
   * Block for stamping the outline of a diamond.
   * @this Blockly.Block
   */
   init: function() {
    this.jsonInit({
      "id": "diamond_stamp",
      "message0": "%1 %2",
      "args0": [
        {
          "type": "input_value",
          "check": "Number",
          "name": "SIZE",
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_diamond.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a diamond",
          "flip_rtl": false
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.JavaScript['diamond_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = block.getInput('SIZE').connection.targetBlock().getFieldValue('CHOICE');
  return 'stampDiamond(' + size + ', \'block_id_' + block.id + '\');\n';
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
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_color.png", 40, 40, "pen icon"));
    this.setPreviousStatement(true, 'Stamp');
    this.setNextStatement(true, 'Stamp');
    this.setTooltip('Change stamp color.');
  }
};

Blockly.JavaScript['turtle_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ', \'block_id_' +
      block.id + '\');\n';
};
