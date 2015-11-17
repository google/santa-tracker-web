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
 * @param {Object.<string>} fields map of field keys to values
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
    var STEP_CONFIGS = {
      leftArm: {
        letter: app.I18n.getMsg('CB_leftArm'),
        image: 'img/block-point-left.svg',
        tooltip: app.I18n.getMsg('CB_leftArmTooltip')
      },
      rightArm: {
        letter: app.I18n.getMsg('CB_rightArm'),
        image: 'img/block-point-right.svg',
        tooltip: app.I18n.getMsg('CB_rightArmTooltip')
      },
      leftFoot: {
        letter: app.I18n.getMsg('CB_leftFoot'),
        image: 'img/block-step-left.svg',
        tooltip: app.I18n.getMsg('CB_leftFootTooltip')
      },
      rightFoot: {
        letter: app.I18n.getMsg('CB_rightFoot'),
        image: 'img/block-step-right.svg',
        tooltip: app.I18n.getMsg('CB_rightFootTooltip')
      },
      jump: {
        letter: app.I18n.getMsg('CB_jump'),
        image: 'img/block-jump.svg',
        tooltip: app.I18n.getMsg('CB_jumpTooltip')
      },
      split: {
        letter: app.I18n.getMsg('CB_split'),
        image: 'img/block-splits.svg',
        tooltip: app.I18n.getMsg('CB_splitTooltip')
      },
      shake: {
        letter: app.I18n.getMsg('CB_shake'),
        image: 'img/block-hip-shake.svg',
        tooltip: app.I18n.getMsg('CB_shakeTooltip')
      }
    };

    var generateBlocksForStep = function(step) {
      Blockly.Blocks['dance_' + step] = generateStepBlock(step);
      Blockly.Blocks['dance_' + step + '_mini'] = generateMiniBlock(step);
      Blockly.JavaScript['dance_' + step] = generateCodeGenerator(step);
    };

    var generateStepBlock = function(step) {
      var stepConfig = STEP_CONFIGS[step];
      var image = stepConfig.image;
      return {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.setHSV(296, 0.491, 0.624);
          this.appendDummyInput()
              .appendField(new Blockly.FieldImage(null, 23, 32))
              .appendField(new Blockly.FieldLabel(stepConfig.letter));
          this.setFillPattern(
              app.Patterns.addPattern('pat_' + step, image, 48, 48, -30, 0));
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(stepConfig.tooltip);
        }
      };
    };

    var generateMiniBlock = function(step) {
      var stepConfig = STEP_CONFIGS[step];
      var image = stepConfig.image;
      return {
        helpUrl: '',

        /**
         * @this {Blockly.Block}
         */
        init: function() {
          this.setHSV(296, 0.491, 0.624);
          this.appendDummyInput()
              .appendField(new Blockly.FieldImage(null, 48 - 24, 43 - 10));
          this.setFillPattern(
              app.Patterns.addPattern('minipat_' + step, image, 48, 48, 0, 0));
          this.setMini(true);
          this.setTooltip(stepConfig.tooltip);
        }
      };
    };

    var generateCodeGenerator = function(step) {
      return function() {
        return 'api.' + step + '(\'block_id_' + this.id + '\');\n';
      };
    };

    generateBlocksForStep('leftArm');
    generateBlocksForStep('rightArm');
    generateBlocksForStep('leftFoot');
    generateBlocksForStep('rightFoot');
    generateBlocksForStep('jump');
    generateBlocksForStep('split');
    generateBlocksForStep('shake');
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
};
