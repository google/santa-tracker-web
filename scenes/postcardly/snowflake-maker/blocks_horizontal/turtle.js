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
            "src": Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/snowflake.svg",
            "width": 40,
            "height": 40,
            "alt": "snowflake",
            "flip_rtl": false
          }
        ],
        "previousStatement": null,
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
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/forward.svg", 40, 40, "move forward"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
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
   * Block for moving forward or backwards.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/backward.png", 40, 40, "move backward"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
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

Blockly.JavaScript['turtle_move_internal'] = function(block) {
  // Generate JavaScript for moving forward or backwards.
  var value = block.getFieldValue('VALUE');
  return block.getFieldValue('DIR') +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_turn_left'] = {
  /**
   * Block for turning left or right.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/turn_left.svg", 40, 40, "turn left"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
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
   * Block for turning left or right.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/turn_right.svg", 40, 40, "turn right"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['turtle_turn_right'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return 'turnRight' +
      '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_turn_internal'] = {
  /**
   * Block for turning left or right.
   * @this Blockly.Block
   */
  init: function() {
    var DIRECTIONS =
        [['SOME_MESSAGE', 'turnRight'],
         ['SOME_MESSAGE', 'turnLeft']];
    var VALUES =
        [['1\u00B0', '1'],
         ['45\u00B0', '45'],
         ['72\u00B0', '72'],
         ['90\u00B0', '90'],
         ['120\u00B0', '120'],
         ['144\u00B0', '144']];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += Turtle.Blocks.RIGHT_TURN;
    DIRECTIONS[1][0] += Turtle.Blocks.LEFT_TURN;
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
        .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['turtle_turn_internal'] = function(block) {
  // Generate JavaScript for turning left or right.
  var value = block.getFieldValue('VALUE');
  return block.getFieldValue('DIR') +
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
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/triangle_outline_draw.svg", 40, 40, "draw shape outline"));
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
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/square_outline_stamp.svg", 40, 40, "outlined shape"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['square_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampSquare(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['circle_stamp'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/circle_outline_stamp.svg", 40, 40, "outlined shape"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['circle_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampCircle(' + size + ', \'block_id_' + block.id + '\');\n';
};


Blockly.Blocks['triangle_stamp'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/triangle_outline_stamp.svg", 40, 40, "outlined shape"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['triangle_stamp'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampTriangle(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['circle_stamp_fill'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/circle_fill_stamp.svg", 40, 40, "filled shape"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['circle_stamp_fill'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampCircleFill(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['square_stamp_fill'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/square_fill_stamp.svg", 40, 40, "filled shape"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['square_stamp_fill'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampSquareFill(' + size + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['triangle_stamp_fill'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('SIZE')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/triangle_fill_stamp.svg", 40, 40, "filled shape"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['triangle_stamp_fill'] = function(block) {
  // Generate JavaScript for setting the width.
  var size = Blockly.JavaScript.valueToCode(block, 'SIZE',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'stampTriangleFill(' + size + ', \'block_id_' + block.id + '\');\n';
};


Blockly.Blocks['turtle_width'] = {
  /**
   * Block for setting the width.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Colours.pen.primary, Blockly.Colours.pen.secondary, Blockly.Colours.pen.tertiary);
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/turtle/pen.svg", 40, 40, "pen icon"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['turtle_width'] = function(block) {
  // Generate JavaScript for setting the width.
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_NONE) || '1';
  return 'penWidth(' + width + ', \'block_id_' + block.id + '\');\n';
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

Blockly.Blocks['turtle_colour_internal'] = {
  /**
   * Block for setting the colour.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.colour.HUE);
    this.appendDummyInput()
        .appendField('SOME_MESSAGE')
        .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['turtle_colour_internal'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = '\'' + block.getFieldValue('COLOUR') + '\'';
  return 'penColour(' + colour + ', \'block_id_' +
      block.id + '\');\n';
};
