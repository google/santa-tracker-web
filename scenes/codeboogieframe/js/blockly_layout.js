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

goog.provide('app.BlocklyLayout');

/**
 * Handles smart layouting of blockly elements.
 * @param {!app.Blockly} blockly instance.
 * @param {!app.Game} game instance.
 * @constructor
 */
app.BlocklyLayout = function(blockly, game) {
  this.blockly_ = blockly;
  this.layoutRequest_ = null;
  this.game_ = game;
  this.windowHeight = window.innerHeight;
  this.windowWidth = window.innerWidth;

  window.addEventListener('resize', this.onResize_.bind(this), false);
};

/**
 * Whitespace between blocks on mobile.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_GAP = 10;
/**
 * Whitespace between blocks on desktop.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MD_GAP = 24;

/**
 * Whitespace to left/right edges on mobile.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MARGIN = 10;
/**
 * Whitespace to left/right edges on tablet.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_SM_MARGIN = 24;
/**
 * Whitespace to left/right edges on desktop.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MD_MARGIN = 59;

/**
 * Whitespace to top on mobile.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_TOP = 10;
/**
 * Whitespace to top on tablet.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_SM_TOP = 24;
/**
 * Whitespace to top on desktop.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MD_TOP = 210;

/**
 * Top position of when run block on mobile.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_TOP = 10;
/**
 * Top position of when run block on tablet.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_SM_TOP = 24;
/**
 * Top position of when run block on desktop.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_MD_TOP = 32;

/**
 * Left position of when run block on mobile.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_LEFT = 10;
/**
 * Left position of when run block on tablet.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_SM_LEFT = 24;
/**
 * Left position of when run block on desktop.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_MD_LEFT = 32;

/**
 * Schedules re-layout of workspace. May happen for many reasons but only runs
 * once after timeout.
 */
app.BlocklyLayout.prototype.scheduleLayout = function() {
  if (this.layoutRequest_ != null) {
    return;
  }
  this.layoutRequest_ = setTimeout(this.layoutWorkspace_.bind(this), 0);
};

/**
 * Handler for window resize. Responsively lays out toolbar and workspace.
 * @private
 */
app.BlocklyLayout.prototype.onResize_ = function() {
  if (this.windowHeight !== window.innerHeight ||
      this.windowWidth !== window.innerWidth) {
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;

    this.blockly_.reflowToolbar();

    // Redundant since toolbar reflow likely does this.
    this.scheduleLayout();
  }
};

/**
 * Relays out the toolbar.
 * @param {Array.<Blockly.Block>} blocks contained in the toolbar.
 * @return {number} the new width of the toolbar.
 */
app.BlocklyLayout.prototype.layoutToolbox = function(blocks) {
  if (blocks.length === 0) {
    return 0;
  }

  if (this.windowWidth > 1024) {
    return this.layoutToolboxCardinal_(blocks);
  } else {
    return this.layoutToolboxRow_(blocks);
  }
};

/**
 * Lays out blocks in a fairly tight row, for mobile and tablet.
 * @param {!Array.<!Blockly.Block>} blocks contained in the toolbar.
 * @return {number} the new width of the toolbar.
 * @private
 */
app.BlocklyLayout.prototype.layoutToolboxRow_ = function(blocks) {
  // Responsive variables
  var blockWidth = 0;
  var gap = app.BlocklyLayout.TOOLBOX_GAP;
  var margin = app.BlocklyLayout.TOOLBOX_MARGIN;
  var cursorY = app.BlocklyLayout.TOOLBOX_TOP;
  if (this.windowWidth > 660) {
    margin = app.BlocklyLayout.TOOLBOX_SM_MARGIN;
    cursorY = app.BlocklyLayout.TOOLBOX_SM_TOP;
  }

  for (var i = 0, block; block = blocks[i]; i++) {
    var root = block.getSvgRoot();
    var blockHW = block.getHeightWidth();
    blockWidth = blockHW.width;
    block.moveTo(margin, cursorY);
    cursorY += blockHW.height + gap;
  }

  return blockWidth + margin * 2;
};

app.BlocklyLayout.prototype.layoutToolboxCardinal_ = function(blocks) {
  var cursorY = app.BlocklyLayout.TOOLBOX_MD_TOP;
  var margin = app.BlocklyLayout.TOOLBOX_MD_MARGIN;
  var gap = app.BlocklyLayout.TOOLBOX_MD_GAP;
  var blockSize = blocks[0].getHeightWidth();
  var toolboxWidth = (blockSize.width + gap) * 2 - gap + margin * 2;

  // Three columns.
  var leftX = toolboxWidth / 2 - (blockSize.width + gap / 2);
  var centerX = toolboxWidth / 2 - blockSize.width / 2;
  var rightX = toolboxWidth / 2 + gap / 2;

  // Dance moves
  for (var i = 0, block; block = blocks[i]; i++) {
    if (i > 0 && i % 2 === 0) {
      cursorY += blockSize.height + gap;
    }
    block.moveTo(i % 2 === 0 ? leftX : rightX, cursorY);
  }

  cursorY += blockSize.height;
  // Repeat
  //if (blocks.length > 4) {
  //  blocks[4].moveTo(centerX, cursorY);
  //}

  return toolboxWidth;
};

/**
 * Reorganizes out the workspace.
 * @private
 */
app.BlocklyLayout.prototype.layoutWorkspace_ = function() {
  this.layoutRequest_ = null;
  var leftEdge = this.blockly_.getToolbarWidth();
  var blocklyWidth = this.windowWidth - this.game_.scene.getWidth();
  var workspaceWidth = blocklyWidth - leftEdge;
  this.blockly_.el.style.width = blocklyWidth + 'px';

  var whenrunLeft = app.BlocklyLayout.WHENRUN_LEFT;
  var whenrunTop = app.BlocklyLayout.WHENRUN_TOP;
  if (this.windowWidth > 660) {
    whenrunLeft = app.BlocklyLayout.WHENRUN_SM_LEFT;
    whenrunTop = app.BlocklyLayout.WHENRUN_SM_TOP;
  }
  if (this.windowWidth > 1024) {
    whenrunLeft = app.BlocklyLayout.WHENRUN_MD_LEFT;
    whenrunTop = app.BlocklyLayout.WHENRUN_MD_TOP;
  }

  var blocks = this.blockly_.getTopBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type === 'when_run') {
      block.moveTo(whenrunLeft, whenrunTop);
    }
  }
};
