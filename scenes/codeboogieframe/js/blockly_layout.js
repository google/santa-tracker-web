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
'use strict';

goog.provide('app.BlocklyLayout');

/**
 * Handles smart layouting of blockly elements.
 * @param {!app.Blockly} blockly instance.
 * @param {!app.Game} game instance.
 * @constructor
 */
app.BlocklyLayout = class {
  constructor(blockly, game) {
    this.blockly_ = blockly;
    /** @type {?number} */
    this.layoutRequest_ = null;
    this.game_ = game;
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;

    window.addEventListener('resize', this.onResize_.bind(this), false);
  }


  /**
   * Schedules re-layout of workspace. May happen for many reasons but only runs
   * once after timeout.
   */
  scheduleLayout() {
    if (this.layoutRequest_ != null) {
      return;
    }
    this.layoutRequest_ = setTimeout(this.layoutWorkspace_.bind(this), 0);
  }

  /**
   * Handler for window resize. Responsively lays out toolbar and workspace.
   * @private
   */
  onResize_() {
    if (this.windowHeight !== window.innerHeight ||
        this.windowWidth !== window.innerWidth) {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;

      this.blockly_.reflowToolbar();

      // Redundant since toolbar reflow likely does this.
      this.scheduleLayout();
    }
  }

  /**
   * Relays out the toolbar.
   * @param {Array.<Blockly.Block>} blocks contained in the toolbar.
   * @return {number} the new width of the toolbar.
   */
  layoutToolbox(blocks) {
    if (blocks.length === 0) {
      return 0;
    }

    if (this.windowWidth > 1024) {
      return this.layoutToolboxCardinal_(blocks);
    } else {
      return this.layoutToolboxRow_(blocks);
    }
  }

  /**
   * Lays out blocks in a fairly tight row, for mobile and tablet.
   * @param {!Array.<!Blockly.Block>} blocks contained in the toolbar.
   * @return {number} the new width of the toolbar.
   * @private
   */
  layoutToolboxRow_(blocks) {
    // Responsive variables
    let blockWidth = 0;
    let gap = app.BlocklyLayout.TOOLBOX_GAP;
    let margin = app.BlocklyLayout.TOOLBOX_MARGIN;
    let cursorY = app.BlocklyLayout.TOOLBOX_TOP;
    if (this.windowWidth > 660) {
      margin = app.BlocklyLayout.TOOLBOX_SM_MARGIN;
      cursorY = app.BlocklyLayout.TOOLBOX_SM_TOP;
    }

    for (let i = 0, block = null; block = blocks[i]; i++) {
      let root = block.getSvgRoot();
      let blockHW = block.getHeightWidth();
      blockWidth = blockHW.width;
      block.moveTo(margin, cursorY);
      cursorY += blockHW.height + gap;
    }

    return blockWidth + margin * 2;
  }

  layoutToolboxCardinal_(blocks) {
    let cursorY = this.windowHeight >= 600 ? app.BlocklyLayout.TOOLBOX_MD_TOP :
        app.BlocklyLayout.TOOLBOX_MD_SHORT_TOP;
    let margin = app.BlocklyLayout.TOOLBOX_MD_MARGIN;
    let gap = app.BlocklyLayout.TOOLBOX_MD_GAP;
    let blockSize = blocks[0].getHeightWidth();
    let toolboxWidth = (blockSize.width + gap) * 2 - gap + margin * 2;

    // Two columns.
    let leftX = toolboxWidth / 2 - (blockSize.width + gap / 2);
    let rightX = toolboxWidth / 2 + gap / 2;

    // Layout blocks in two columns, in order.
    for (let i = 0, block = null; block = blocks[i]; i++) {
      if (i > 0 && i % 2 === 0) {
        cursorY += blockSize.height + gap;
      }
      block.moveTo(i % 2 === 0 ? leftX : rightX, cursorY);
    }

    return toolboxWidth;
  }

  /**
   * Reorganizes out the workspace.
   * @private
   */
  layoutWorkspace_() {
    this.layoutRequest_ = null;
    let leftEdge = this.blockly_.getToolbarWidth();
    let blocklyWidth = this.windowWidth - this.game_.scene.getWidth();
    let workspaceWidth = blocklyWidth - leftEdge;
    this.blockly_.el.style.width = blocklyWidth + 'px';

    let whenrunLeft = app.BlocklyLayout.WHENRUN_LEFT;
    let whenrunTop = app.BlocklyLayout.WHENRUN_TOP;
    if (this.windowWidth > 660) {
      whenrunLeft = app.BlocklyLayout.WHENRUN_SM_LEFT;
      whenrunTop = app.BlocklyLayout.WHENRUN_SM_TOP;
    }
    if (this.windowWidth > 1024) {
      whenrunLeft = app.BlocklyLayout.WHENRUN_MD_LEFT;
      whenrunTop = app.BlocklyLayout.WHENRUN_MD_TOP;
    }

    let blocks = this.blockly_.getTopBlocks(false);
    for (let i = 0, block = null; block = blocks[i]; i++) {
      if (block.type === 'when_run') {
        block.moveTo(whenrunLeft, whenrunTop);
      }
    }
  }
};

/**
 * Whitespace between blocks on mobile.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_GAP = 10;
/**
 * Whitespace between blocks on desktop.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_MD_GAP = 24;

/**
 * Whitespace to left/right edges on mobile.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_MARGIN = 10;
/**
 * Whitespace to left/right edges on tablet.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_SM_MARGIN = 24;
/**
 * Whitespace to left/right edges on desktop.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_MD_MARGIN = 59;

/**
 * Whitespace to top on mobile.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_TOP = 10;
/**
 * Whitespace to top on tablet.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_SM_TOP = 24;
/**
 * Whitespace to top on desktop.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_MD_TOP = 160;
/**
 * Whitespace to top on short desktop.
 * @const {number}
 */
app.BlocklyLayout.TOOLBOX_MD_SHORT_TOP = 90;

/**
 * Top position of when run block on mobile.
 * @const {number}
 */
app.BlocklyLayout.WHENRUN_TOP = 10;
/**
 * Top position of when run block on tablet.
 * @const {number}
 */
app.BlocklyLayout.WHENRUN_SM_TOP = 24;
/**
 * Top position of when run block on desktop.
 * @const {number}
 */
app.BlocklyLayout.WHENRUN_MD_TOP = 32;

/**
 * Left position of when run block on mobile.
 * @const {number}
 */
app.BlocklyLayout.WHENRUN_LEFT = 10;
/**
 * Left position of when run block on tablet.
 * @const {number}
 */
app.BlocklyLayout.WHENRUN_SM_LEFT = 24;
/**
 * Left position of when run block on desktop.
 * @const {number}
 */
app.BlocklyLayout.WHENRUN_MD_LEFT = 32;
