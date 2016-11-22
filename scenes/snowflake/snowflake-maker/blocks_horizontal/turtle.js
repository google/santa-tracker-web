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

Turtle.Blocks.ICON_SIZE = 48;

Turtle.Blocks.COLOUR_CHOICES = ['#e53935','#fb8c00', '#facf00', '#7cb342',
'#29b6f6', '#ab47bc', '#f06292', '#b3e5fc'];

Turtle.Blocks.makeMenuIcon_ = function(path, value, alt) {
  return {
    src: Blockly.mainWorkspace.options.pathToMedia + 'icons/ic_block_' + path + '.png',
    value: value,
    width: Turtle.Blocks.ICON_SIZE,
    height: Turtle.Blocks.ICON_SIZE,
    alt: alt
  };
};

Turtle.Blocks.categoryColours =
  {
    starter: {primary:"#ffeb3b",secondary:"#fdd835",tertiary:"#f9a825"},
    pen: {primary:"#3f51b5",secondary:"#3949ab",tertiary:"#303f9f"},
    shapes: {primary:"#0fBD8C",secondary:"#00aa75",tertiary:"#0B8E69"},
    movement: {primary:"#2196f3",secondary:"#1e88e5",tertiary:"#1976d2"},
  };

// Extensions to Blockly's language and JavaScript generator.
Blockly.Blocks['snowflake_start'] = {
  init: function() {
    this.jsonInit({
      "id": "snowflake_start",
      "message0": "%1",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/btn_start.png",
          "width": 40,
          "height": 40,
          "alt": "snowflake",
          "flip_rtl": true
        }
      ],
      "nextStatement": "Stamp",
      "inputsInline": true,
      "category": Blockly.Categories.turtle,
      "colour": Turtle.Blocks.categoryColours['starter'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['starter'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['starter'].tertiary
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
        "colour": Turtle.Blocks.categoryColours['starter'].primary,
        "colourSecondary": Turtle.Blocks.categoryColours['starter'].secondary,
        "colourTertiary": Turtle.Blocks.categoryColours['starter'].tertiary
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
      branch + 'if(' +
      loopVar + ' == 0){\n pause(500);\n' +
      '}\n reset();\n turnRight(60*(' +
      loopVar + '+1), \'block_id_' +
      block.id + '\');\n setOnRepeat(true);\n' +
      'pause(500)\n}\n';
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
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_forward_sm.png",
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
      "colour": Turtle.Blocks.categoryColours['movement'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['movement'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['movement'].tertiary
    });
  }
};

Blockly.Blocks['dropdown_move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("forward_sm", '10', 'move 10'),
          Turtle.Blocks.makeMenuIcon_("forward_med", '20', 'move 20'),
          Turtle.Blocks.makeMenuIcon_("forward_lg", '30', 'move 30'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['movement'].primary,
      Turtle.Blocks.categoryColours['movement'].secondary,
      Turtle.Blocks.categoryColours['movement'].tertiary
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
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_back_sm.png",
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
      "colour": Turtle.Blocks.categoryColours['movement'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['movement'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['movement'].tertiary
    });
  }
};

Blockly.Blocks['dropdown_move_backward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("back_sm", '10', 'move 10'),
          Turtle.Blocks.makeMenuIcon_("back_med", '20', 'move 20'),
          Turtle.Blocks.makeMenuIcon_("back_lg", '30', 'move 30'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['movement'].primary,
      Turtle.Blocks.categoryColours['movement'].secondary,
      Turtle.Blocks.categoryColours['movement'].tertiary
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
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_ccw_030.png",
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
      "colour": Turtle.Blocks.categoryColours['movement'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['movement'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['movement'].tertiary
    });
  }
};

Blockly.Blocks['dropdown_turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("ccw_030", '30', '30'),
          Turtle.Blocks.makeMenuIcon_("ccw_060", '60', '60'),
          Turtle.Blocks.makeMenuIcon_("ccw_090", '90', '90'),
          Turtle.Blocks.makeMenuIcon_("ccw_120", '120', '120'),
          Turtle.Blocks.makeMenuIcon_("ccw_150", '150', '150'),
          Turtle.Blocks.makeMenuIcon_("ccw_180", '180', '180'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['movement'].primary,
      Turtle.Blocks.categoryColours['movement'].secondary,
      Turtle.Blocks.categoryColours['movement'].tertiary
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
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_cw030.png",
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
      "colour": Turtle.Blocks.categoryColours['movement'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['movement'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['movement'].tertiary
    });
  }
};

Blockly.Blocks['dropdown_turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("cw_030", '30', '30'),
          Turtle.Blocks.makeMenuIcon_("cw_060", '60', '60'),
          Turtle.Blocks.makeMenuIcon_("cw_090", '90', '90'),
          Turtle.Blocks.makeMenuIcon_("cw_120", '120', '120'),
          Turtle.Blocks.makeMenuIcon_("cw_150", '150', '150'),
          Turtle.Blocks.makeMenuIcon_("cw_180", '180', '180'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['movement'].primary,
      Turtle.Blocks.categoryColours['movement'].secondary,
      Turtle.Blocks.categoryColours['movement'].tertiary
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
    this.setColour(Turtle.Blocks.categoryColours['shapes'].primary, Turtle.Blocks.categoryColours['shapes'].secondary, Turtle.Blocks.categoryColours['shapes'].tertiary);
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
      "colour": Turtle.Blocks.categoryColours['shapes'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['shapes'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['shapes'].tertiary
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
          Turtle.Blocks.makeMenuIcon_("square_1", '25', '25'),
          Turtle.Blocks.makeMenuIcon_("square_2", '45', '45'),
          Turtle.Blocks.makeMenuIcon_("square_3", '65', '65'),
          Turtle.Blocks.makeMenuIcon_("square_4", '85', '85'),
          Turtle.Blocks.makeMenuIcon_("square_5", '105', '105'),
          Turtle.Blocks.makeMenuIcon_("square_6", '125', '125'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['shapes'].primary,
      Turtle.Blocks.categoryColours['shapes'].secondary,
      Turtle.Blocks.categoryColours['shapes'].tertiary
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
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_pentagram_1.png",
          "width": 40,
          "height": 40,
          "alt": "stamp the outline of a pentagon",
          "flip_rtl": false
        }
      ],
      "previousStatement": "Stamp",
      "nextStatement": "Stamp",
      "category": Blockly.Categories.turtle,
      "colour": Turtle.Blocks.categoryColours['shapes'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['shapes'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['shapes'].tertiary
    });
  }
};

Blockly.Blocks['dropdown_pentagon'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("pentagram_1", '25', '25'),
          Turtle.Blocks.makeMenuIcon_("pentagram_2", '45', '45'),
          Turtle.Blocks.makeMenuIcon_("pentagram_3", '65', '65'),
          Turtle.Blocks.makeMenuIcon_("pentagram_4", '85', '85'),
          Turtle.Blocks.makeMenuIcon_("pentagram_5", '105', '105'),
          Turtle.Blocks.makeMenuIcon_("pentagram_6", '125', '125'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['shapes'].primary,
      Turtle.Blocks.categoryColours['shapes'].secondary,
      Turtle.Blocks.categoryColours['shapes'].tertiary
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
      "colour": Turtle.Blocks.categoryColours['shapes'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['shapes'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['shapes'].tertiary
    });
  }
};

Blockly.Blocks['dropdown_triangle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("triangle_1", '25', '25'),
          Turtle.Blocks.makeMenuIcon_("triangle_2", '45', '45'),
          Turtle.Blocks.makeMenuIcon_("triangle_3", '65', '65'),
          Turtle.Blocks.makeMenuIcon_("triangle_4", '85', '85'),
          Turtle.Blocks.makeMenuIcon_("triangle_5", '105', '105'),
          Turtle.Blocks.makeMenuIcon_("triangle_6", '125', '125'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['shapes'].primary,
      Turtle.Blocks.categoryColours['shapes'].secondary,
      Turtle.Blocks.categoryColours['shapes'].tertiary
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
      "colour": Turtle.Blocks.categoryColours['shapes'].primary,
      "colourSecondary": Turtle.Blocks.categoryColours['shapes'].secondary,
      "colourTertiary": Turtle.Blocks.categoryColours['shapes'].tertiary
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
    this.setColour(Turtle.Blocks.categoryColours['pen'].primary, Turtle.Blocks.categoryColours['pen'].secondary, Turtle.Blocks.categoryColours['pen'].tertiary);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(new Blockly.FieldImage(Blockly.mainWorkspace.options.pathToMedia + "icons/ic_block_color09.png", 40, 40, "pen icon"));
    this.setPreviousStatement(true, 'Stamp');
    this.setNextStatement(true, 'Stamp');
    this.setTooltip('Change stamp color.');
  }
};

Blockly.JavaScript['turtle_colour'] = function(block) {
  // Generate JavaScript for setting the colour.

  var colour = block.getInput('COLOUR').connection.targetBlock().
      getFieldValue('CHOICE');

  if (colour == 'random') {
    colour = Turtle.Blocks.COLOUR_CHOICES[Math.floor(Math.random() *
      Turtle.Blocks.COLOUR_CHOICES.length)];
  }
  return 'penColour("' + colour + '", \'block_id_' +
      block.id + '\');\n';
};

Blockly.Blocks['dropdown_colour'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu([
          Turtle.Blocks.makeMenuIcon_("color01", '#e53935', 'red'),
          Turtle.Blocks.makeMenuIcon_("color02", '#fb8c00', 'orange'),
          Turtle.Blocks.makeMenuIcon_("color03", '#facf00', 'yellow'),
          Turtle.Blocks.makeMenuIcon_("color04", '#7cb342', 'green'),
          Turtle.Blocks.makeMenuIcon_("color05", '#29b6f6', 'blue'),
          Turtle.Blocks.makeMenuIcon_("color06", '#ab47bc', 'purple'),
          Turtle.Blocks.makeMenuIcon_("color07", '#f06292', 'pink'),
          Turtle.Blocks.makeMenuIcon_("color08", '#b3e5fc', 'light blue'),
          Turtle.Blocks.makeMenuIcon_("color09", 'random', 'random'),
        ]), 'CHOICE');
    this.setOutput(true);
    this.setColour(Turtle.Blocks.categoryColours['pen'].primary,
      Turtle.Blocks.categoryColours['pen'].secondary,
      Turtle.Blocks.categoryColours['pen'].tertiary
    );
  }
};
