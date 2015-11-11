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

goog.provide('app.Blockly');

goog.require('Blockly');
goog.require('Blockly.inject');
goog.require('app.BlocklyLayout');
goog.require('app.LevelResult');
goog.require('app.blocks');

/**
 * A interface for the blockly library and UI.
 * @param {!Element} el dom element to inject Blockly into.
 * @param {!app.Game} game instance.
 * @constructor
 */
app.Blockly = function(el, game) {
  this.cachedBlockStates_ = [];
  this.changeListener_ = null;
  this.currentLevel = null;
  this.el = el;
  this.game = game;
  this.layout = new app.BlocklyLayout(this, game);

  // Bind handlers.
  this.checkGoalCondition_ = this.checkGoalCondition_.bind(this);

  this.initBlockly_();
};

app.Blockly.prototype = {
  /**
   * Installs our blocks and injects blockly into markup.
   * @private
   */
  initBlockly_: function() {
    app.blocks.install();

    Blockly.SNAP_RADIUS = 60;
    Blockly.inject(this.el, {
      scrollbars: false,
      path: './img/',
      sounds: false,
      toolbox: '<xml></xml>',
      toolboxLayout: this.layout.layoutToolbox.bind(this.layout),
      touch: true
    });
  },

  /**
   * Configure blockly for a new level. Initiates the toolbox and workspace.
   * @param {!app.Level} level to load into blockly.
   */
  setLevel: function(level) {
    // Clean up from last level.
    if (this.changeListener_) {
      Blockly.removeChangeListener(this.changeListener_);
      this.changeListener_ = null;
    }

    // Set the level.
    this.currentLevel = level;

    // Load it.
    Blockly.updateToolbox(this.currentLevel.toolbox);
    this.resetToolboxScroll_();

    this.loadBlocks_();

    this.layout.scheduleLayout();

    // Maybe check for changes and success.
    if (this.currentLevel.checkSuccess) {
      this.changeListener_ = Blockly.addChangeListener(this.checkGoalCondition_);
    }
  },

  /**
   * Translate the workspace sideways to avoid the fixed toolbox.
   * @private
   */
  resetToolboxScroll_: function() {
    Blockly.mainWorkspace.scrollX = Blockly.mainWorkspace.flyout_.width_;
    if (Blockly.RTL) {
      Blockly.mainWorkspace.scrollX *= -1;
    }
    var translation = 'translate(' + Blockly.mainWorkspace.scrollX + ', 0)';
    Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
    Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform',
                                                         translation);
  },

  reflowToolbar: function() {
    Blockly.mainWorkspace.flyout_.reflow();
  },

  getToolbarWidth: function() {
    return Blockly.mainWorkspace.flyout_.width_;
  },

  /**
   * Loads starting blocks for the level into the workspace.
   * @private
   */
  loadBlocks_: function() {
    var xml = Blockly.Xml.textToDom(this.currentLevel.startBlocks);
    if (this.currentLevel.insertWhenRun) {
      this.insertWhenRunBlock_(xml);
    }
    this.arrangeBlockPosition_(xml);

    Blockly.mainWorkspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  },

  /**
   * Inserts a when run block into a level's starting blocks.
   * @param {!Node} root of starting blocks xml
   * @private
   */
  insertWhenRunBlock_: function(root) {
    // Extract the document from the root.
    var doc = root.parentNode;

    var whenRun = doc.createElement('block');
    whenRun.setAttribute('type', 'when_run');
    whenRun.setAttribute('movable', 'false');
    whenRun.setAttribute('deletable', 'false');

    var numChildren = root.childNodes ? root.childNodes.length : 0;

    // find the first block and extract it
    var firstBlock = null, i = 0;
    while (i < numChildren && firstBlock === null) {
      var child = root.childNodes[i];
      // only look at element nodes
      if (child.nodeType === 1) {
        firstBlock = root.removeChild(child);
        numChildren--;
      }
      i++;
    }

    if (firstBlock !== null) {
      // when run -> next -> firstBlock
      var next = doc.createElement('next');
      next.appendChild(firstBlock);
      whenRun.appendChild(next);
    }

    if (numChildren > 0) {
      root.insertBefore(whenRun, root.childNodes[0]);
    } else {
      root.appendChild(whenRun);
    }
  },

  /**
   * Arranges starting blocks in the workspace.
   * @param {!Node} xml root node of workspace.
   * @private
   */
  arrangeBlockPosition_: function(xml) {
    var numberOfPlacedBlocks = 0;
    var cursorY = (window.innerWidth > 1024 ? 213 : app.Constants.BLOCK_Y_COORDINATE);
    for (var x = 0, xmlChild; xml.childNodes && x < xml.childNodes.length; x++) {
      xmlChild = xml.childNodes[x];

      // Only look at element nodes
      if (xmlChild.nodeType === 1) {
        xmlChild.setAttribute('x', xmlChild.getAttribute('x') ||
            app.Constants.BLOCK_X_COORDINATE);
        xmlChild.setAttribute('y', xmlChild.getAttribute('y') ||
            cursorY);

        if (xmlChild.getAttribute('height')) {
          cursorY += +xmlChild.getAttribute('height') + 20;
        } else {
          cursorY += app.Constants.BLOCK_Y_COORDINATE_INTERVAL;
        }
      }
    }
  },

  /**
   * Checks if goal condition has been reached, bumping the level.
   * @private
   */
  checkGoalCondition_: function() {
    var isDone = this.currentLevel.checkSuccess();
    if (isDone) {
      Blockly.removeChangeListener(this.changeListener_);
      this.changeListener_ = null;

      this.game.successResult.show(new app.LevelResult(true, null, {
        allowRetry: false,
        graphic: '#result-puzzle'
      }));
    }
  },

  highlightBlock: function(id) {
    if (id) {
      var m = id.match(/^block_id_(\d+)$/);
      if (m) {
        id = m[1];
      }
    }
    Blockly.mainWorkspace.highlightBlock(id);
  },

  toggleExecution: function(isRunning) {
    if (!isRunning) {
      this.highlightBlock(null);
    }

    Blockly.mainWorkspace.traceOn(isRunning);
    Blockly.mainWorkspace.setEnableToolbox(!isRunning);
  },

  /**
   * Get JS code represented by the blocks.
   * @return {string} JS code.
   */
  getCode: function() {
    return Blockly.JavaScript.workspaceToCode();
  },

  /**
   * Gets a cleaned up version of the code represented by blocks.
   * @return {string} Clean JS code.
   */
  getUserCode: function() {
    var code = this.getCode();
    code = code
        // Hide block id highlight arguments
        .replace(/(,\s*)?'block_id_\d+'/g, '').

        // Hide loop highlight statement.
        replace(/\s*api\.highlightLoop\('\d+'\);/gm, '').

        // Hide the api object.
        replace(/api\./g, '').

        // Make loop variables shorter for mobile.
        replace(/\bcount2\b/g, 'j').
        replace(/\bcount\b/g, 'i').

        // Extra newline in end of code
        replace(/\s*$/gm, '');

    return code;
  },

  /**
   * Gets top level blocks from the main workspace.
   * @return {!Array.<!Blockly.Block>} All top blocks.
   */
  getTopBlocks: function(ordered) {
    return Blockly.mainWorkspace.getTopBlocks(ordered);
  },

  /**
   * Get blocks that the user intends in the program. These are the blocks that
   * are used when checking for required blocks and when determining lines of code
   * written.
   * @return {!Array.<!Blockly.Block>} The blocks.
   */
  getUserBlocks: function() {
    var allBlocks = Blockly.mainWorkspace.getAllBlocks();
    var blocks = allBlocks.filter(function(block) {
      return !block.disabled && block.isEditable() && block.type !== 'when_run';
    });
    return blocks;
  },

  /**
   * Get countable blocks in the program, namely any that are not disabled.
   * These are used when determined the number of blocks relative to the ideal
   * block count.
   * @return {!Array.<!Blockly.Block>} The blocks.
   */
  getCountableBlocks: function() {
    var allBlocks = Blockly.mainWorkspace.getAllBlocks();
    var blocks = allBlocks.filter(function(block) {
      return !block.disabled && block.type !== 'when_run';
    });
    return blocks;
  },

  /**
   * Check user's code for empty container blocks, such as "repeat".
   * @return {boolean} true if a block is empty (no blocks are nested inside).
   */
  hasEmptyContainerBlocks: function() {
    var blocks = Blockly.mainWorkspace.getAllBlocks();
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      for (var j = 0; j < block.inputList.length; j++) {
        var input = block.inputList[j];
        if (input.type == Blockly.NEXT_STATEMENT &&
            !input.connection.targetConnection) {
          return true;
        }
      }
    }
    return false;
  },

  /**
   * Do we have any floating blocks not attached to an event block or function block?
   * @return {boolean} true if there is more than one top block.
   */
  hasExtraTopBlocks: function() {
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    for (var i = 0; i < topBlocks.length; i++) {
      // ignore disabled top blocks
      if (topBlocks[i].disabled) {
        continue;
      }
      // None of our top level blocks should have a previous connection.
      if (topBlocks[i].previousConnection) {
        return true;
      }
    }
    return false;
  },

  /**
   * Check to see if the user's code contains the required blocks for a level.
   * @param {!Array.<string>} requiredBlocks array of block id's which are required.
   * @return {!Array.<string>} array of strings where each strings is a blocks that should be used.
   * Each block is represented as it's id.
   */
  getMissingBlocks: function(requiredBlocks) {
    var missingBlocks = [];
    if (!requiredBlocks.length) {
      return missingBlocks;
    }
    var userBlocks = this.getUserBlocks();

    for (var i = 0; i < requiredBlocks.length; i++) {
      var requiredBlock = requiredBlocks[i];

      var usedRequiredBlock = false;
      for (var j = 0; j < userBlocks.length; j++) {
        if (userBlocks[j].type === requiredBlock) {
          // Succeeded, moving to the next required block
          usedRequiredBlock = true;
          break;
        }
      }
      if (!usedRequiredBlock) {
        missingBlocks.push(requiredBlock);
      }
    }
    return missingBlocks;
  }
};
