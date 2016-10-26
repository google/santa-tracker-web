/**
 * Blockly Games: Common code for interfacing with Blockly.
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Common support code for Blockly apps.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyInterface');

goog.require('Blockly');
goog.require('goog.string');

BlocklyInterface.runningBlockId = "";

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
BlocklyInterface.loadBlocks = function(defaultXml) {
  var restore = defaultXml;
  if (restore) {
    BlocklyInterface.setCode(restore);
  }
};

/**
 * Set the given code (XML) to the editor (Blockly).
 * @param {string} code XML code.
 */
BlocklyInterface.setCode = function(code) {
  // Blockly editor.
  var xml = Blockly.Xml.textToDom(code);
  // Clear the workspace to avoid merge.
  Turtle.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, Turtle.workspace);
  Turtle.workspace.clearUndo();
};

/**
 * Get the user's code (XML) from the editor (Blockly).
 * @return {string} XML code.
 */
BlocklyInterface.getCode = function() {
  // Blockly editor.
  var xml = Blockly.Xml.workspaceToDom(Turtle.workspace);
  var text = Blockly.Xml.domToText(xml);
  return text;
};

/**
 * Highlight the block (or clear highlighting).
 * @param {?string} id ID of block that triggered this action.
 */
BlocklyInterface.highlight = function(id) {
  if (BlocklyInterface.runningBlockId != "") {
    Turtle.workspace.glowBlock(BlocklyInterface.runningBlockId, false);
  }
  if (id) {
    var m = id.match(/^block_id_([^']+)$/);
    if (m) {
      id = m[1];
    }
    Turtle.workspace.glowBlock(id, true);
    BlocklyInterface.runningBlockId = id;
  }
};

/**
 * Inject readonly Blockly.  Only inserts once.
 * @param {string} id ID of div to be injected into.
 * @param {string|!Array.<string>} xml XML string(s) describing blocks.
 */
BlocklyInterface.injectReadonly = function(id, xml) {
  var div = document.getElementById(id);
  if (!div.firstChild) {
    var rtl = Turtle.isRtl;
    var workspace = Blockly.inject(div, {'rtl': rtl, 'readOnly': true});
    if (typeof xml != 'string') {
      xml = xml.join('');
    }
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
  }
};

/**
 * Convert the user's code to raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
BlocklyInterface.stripCode = function(code) {
  // Strip out serial numbers.
  return goog.string.trimRight(code.replace(/(,\s*)?'block_id_[^']+'\)/g, ')'));
};

/**
 * Determine if this event is unwanted.
 * @param {!Event} e Mouse or touch event.
 * @return {boolean} True if spam.
 */
BlocklyInterface.eventSpam = function(e) {
  // Touch screens can generate 'touchend' followed shortly thereafter by
  // 'click'.  For now, just look for this very specific combination.
  // Some devices have both mice and touch, but assume the two won't occur
  // within two seconds of each other.
  var touchMouseTime = 2000;
  if (e.type == 'click' &&
      BlocklyInterface.eventSpam.previousType_ == 'touchend' &&
      BlocklyInterface.eventSpam.previousDate_ + touchMouseTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  // Users double-click or double-tap accidentally.
  var doubleClickTime = 400;
  if (BlocklyInterface.eventSpam.previousType_ == e.type &&
      BlocklyInterface.eventSpam.previousDate_ + doubleClickTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  BlocklyInterface.eventSpam.previousType_ = e.type;
  BlocklyInterface.eventSpam.previousDate_ = Date.now();
  return false;
};

BlocklyInterface.eventSpam.previousType_ = null;
BlocklyInterface.eventSpam.previousDate_ = 0;

/**
 * Load the JavaScript interperter.
 */
BlocklyInterface.importInterpreter = function() {
  //<script type="text/javascript"
  //  src="third-party/JS-Interpreter/compiled.js"></script>
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', 'third-party/JS-Interpreter/compiled.js');
  document.head.appendChild(script);
};

//TODO(madCode): delete if we're not showing kids the code they wrote.
/**
 * Load the Prettify CSS and JavaScript.
 */
BlocklyInterface.importPrettify = function() {
  //<link rel="stylesheet" type="text/css" href="common/prettify.css">
  //<script type="text/javascript" src="common/prettify.js"></script>
  // var link = document.createElement('link');
  // link.setAttribute('rel', 'stylesheet');
  // link.setAttribute('type', 'text/css');
  // link.setAttribute('href', 'common/prettify.css');
  // document.head.appendChild(link);
  // var script = document.createElement('script');
  // script.setAttribute('type', 'text/javascript');
  // script.setAttribute('src', 'common/prettify.js');
  // document.head.appendChild(script);
};

// Export symbols that would otherwise be renamed by Closure compiler.
// storage.js is not compiled and calls setCode and getCode.
window['BlocklyInterface'] = BlocklyInterface;
BlocklyInterface['setCode'] = BlocklyInterface.setCode;
BlocklyInterface['getCode'] = BlocklyInterface.getCode;
