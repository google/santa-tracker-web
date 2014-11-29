goog.provide('app.BlocklyLayout');

/**
 * Handles smart layouting of blockly elements.
 * @param {app.Blockly} blockly instance.
 * @param {app.Game} game instance.
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
app.BlocklyLayout.TOOLBOX_GAP = 24;
/**
 * Whitespace between blocks on desktop.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MD_GAP = 32;

/**
 * Whitespace to left/right edges on mobile.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MARGIN = 8;
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
app.BlocklyLayout.TOOLBOX_TOP = 58;
/**
 * Whitespace to top on tablet.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_SM_TOP = 24;
/**
 * Whitespace to top on desktop.
 * @type {number}
 */
app.BlocklyLayout.TOOLBOX_MD_TOP = 220;

/**
 * Top position of when run block on mobile.
 * @type {number}
 */
app.BlocklyLayout.WHENRUN_TOP = 58;
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
app.BlocklyLayout.WHENRUN_LEFT = 8;
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

  // Responsive variables
  var blockWidth = 0;
  var gap = app.BlocklyLayout.TOOLBOX_GAP;
  var columns = 1;
  var margin = app.BlocklyLayout.TOOLBOX_MARGIN;
  var cursorY = app.BlocklyLayout.TOOLBOX_TOP;
  if (this.windowWidth > 660) {
    margin = app.BlocklyLayout.TOOLBOX_SM_MARGIN;
    cursorY = app.BlocklyLayout.TOOLBOX_SM_TOP;
  }
  if (this.windowWidth > 1024) {
    gap = app.BlocklyLayout.TOOLBOX_MD_GAP;
    margin = app.BlocklyLayout.TOOLBOX_MD_MARGIN;
    cursorY = app.BlocklyLayout.TOOLBOX_MD_TOP;
    columns = 2;
  }
  var curCol = 0;

  // Use two columns below scoreboard on desktop. One tight on mobile.
  for (var i = 0, block; block = blocks[i]; i++) {
    var root = block.getSvgRoot();
    var blockHW = block.getHeightWidth();
    blockWidth = blockHW.width;
    var x = margin + curCol * (blockWidth + gap);
    block.moveTo(x, cursorY);
    curCol += 1;

    if (curCol === columns) {
      // Next row.
      curCol = 0;
      cursorY += blockHW.height + gap;
    }
  }

  return (blockWidth + gap) * columns - gap + margin * 2;
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
