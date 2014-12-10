goog.provide('app.BlockRunner');
goog.provide('app.BlockRunnerApi');
goog.provide('app.ResultType');

goog.require('app.Direction');

/**
 * Enum of possible execution results.
 * @enum {string}
 */
app.ResultType = {
  UNSET: 'UNSET',
  SUCCESS: 'SUCCESS',
  TIMEOUT: 'TIMEOUT',
  ERROR: 'ERROR'
};

/**
 * Enum of different animation states for block runner.
 * @enum {string}
 */
app.BlockRunnerState = {
  NOT_ANIMATING: 'NOT_ANIMATING',
  ANIMATING: 'ANIMATING',
  REWINDING: 'REWINDING'
};

/**
 * Runs code from blockly blocks.
 * @param {app.Scene} scene instance.
 * @param {app.Blockly} blockly interface to Blockly.
 * @constructor
 */
app.BlockRunner = function(scene, blockly) {
  this.api = new app.BlockRunnerApi(scene, this);
  this.blockly = blockly;
  this.player = document.timeline.play();
  this.scene = scene;

  // Make sure there is no finish event for this initial state.
  this.player.pause();
  this.player.addEventListener('finish', this.onFinishAnimations_.bind(this), false);

  // Configure Blockly loops to highlight during iteration.
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '  api.highlightLoop(%1);\n';

  this.reset_();
};

/**
 * An es6-style symbol for decorating Animation instances that represent highlights.
 * @type {string}
 */
app.BlockRunner.HIGHLIGHT_SYMBOL = 'CL_highlight';

/**
 * How long should loop highlights last. Note that they attempt to borrow this time from
 * the last block highlight.
 * @type {number}
 */
app.BlockRunner.INJECTED_HIGHLIGHT_DURATION = 150;

app.BlockRunner.prototype = {
  reset_: function() {
    this.animationQueue_ = [];
    this.state_ = app.BlockRunnerState.NOT_ANIMATING;
    this.isTerminated_ = false;
    this.executeResult = app.ResultType.UNSET;
    this.lastBlockId_ = null;
    /* @type {app.LevelResult} */
    this.levelResult = null;
    this.player.source = null;
    this.ticks = 100;
  },

  /**
   * Execute the user's code.  Heaven help us...
   */
  execute: function() {
    if (this.state_ !== app.BlockRunnerState.NOT_ANIMATING) {
      return;
    }

    this.reset_();

    var code = this.blockly.getCode();

    try {
      this.evalWith_(code, {
        api: this.api
      });
    } catch (e) {
      this.executeResult = app.ResultType.ERROR;
      console.log(e);
    }

    if (this.executeResult === app.ResultType.UNSET) {
      this.executeResult = app.ResultType.ERROR;
      this.queueAnimation(this.scene.player.lose());
    }

    var levelComplete = this.executeResult === app.ResultType.SUCCESS;
    this.levelResult = this.scene.level.processResult(levelComplete, this.blockly);

    if (this.levelResult.doNotAnimate) {
      this.reportExecution_();
    } else {
      this.runAnimations_();
    }

    Klang.triggerEvent('computer_play');
  },

  queueAnimation: function(animation, blockId) {
    if (blockId) {
      if (!(animation instanceof AnimationGroup)) {
        animation = new AnimationGroup([animation], {fill: 'forwards'});
      }
      animation.append(this.highlightAnimation_(blockId, animation.duration));
    }
    this.animationQueue_.push(animation);
  },

  injectHighlight: function(blockId) {
    var duration = app.BlockRunner.INJECTED_HIGHLIGHT_DURATION;
    var highlight = this.highlightAnimation_(blockId, duration);

    var animation = this.animationQueue_[this.animationQueue_.length - 1];
    if (animation instanceof AnimationGroup) {
      highlight.timing.delay = animation.duration - duration;

      var lastHighlight = animation.lastChild;
      if (lastHighlight[app.BlockRunner.HIGHLIGHT_SYMBOL]) {
        lastHighlight.timing.duration -= duration;
      }
      animation.append(highlight);
    } else {
      this.animationQueue_.push(highlight);
    }
  },

  highlightAnimation_: function(blockId, duration) {
    var animation = new Animation(document.body, this.highlightEffect_.bind(this, blockId),
        {duration: duration});

    // Mark it with a es6-style symbol
    animation[app.BlockRunner.HIGHLIGHT_SYMBOL] = true;
    return animation;
  },

  highlightEffect_: function(blockId, timing) {
    if (timing != null && blockId !== this.lastBlockId_) {
      this.lastBlockId_ = blockId;
      this.blockly.highlightBlock(blockId);
    }
  },

  beforeAnimations_: function() {
    this.blockly.toggleExecution(true);
  },

  onFinishAnimations_: function() {
    // Animation polyfill runs finish handler once before the first run. Let's ignore that.
    switch (this.state_) {
      case app.BlockRunnerState.NOT_ANIMATING:
        return;

      case app.BlockRunnerState.ANIMATING:
        this.reportExecution_();
        break;

      case app.BlockRunnerState.REWINDING:
        this.scene.portraitToggleScene(false);
        Klang.triggerEvent('computer_rewind_stop');
        break;
    }

    // Reset state.
    app.PlayerSound.reset();
    this.blockly.toggleExecution(false);
    this.state_ = app.BlockRunnerState.NOT_ANIMATING;
    this.lastBlockId_ = null;
  },

  runAnimations_: function() {
    this.beforeAnimations_();

    var fullAnimation = new AnimationSequence(this.animationQueue_);
    this.player.source = fullAnimation;
    this.player.currentTime = 0;
    this.player.playbackRate = this.levelResult.levelComplete ? 1 : 1 / 1.5;
    this.player.play();

    this.state_ = app.BlockRunnerState.ANIMATING;
  },

  restartLevel: function() {
    if (!this.player.source) {
      return;
    }

    this.beforeAnimations_();

    this.player.playbackRate = -4;
    this.player.play();

    this.state_ = app.BlockRunnerState.REWINDING;

    app.PlayerSound.disable();
    Klang.triggerEvent('computer_rewind_start');
  },

  resetAnimation: function() {
    this.player.source = null;
  },

  reportExecution_: function() {
    this.scene.onFinishExecution(this.levelResult);
  },

  isTerminated: function() {
    return this.isTerminated_;
  },

  terminateWithResult: function(result) {
    if (this.isTerminated_) {
      return;
    }

    this.executeResult = result;
    this.isTerminated_ = true;
  },

  evalWith_: function(code, scope) {
    // execute JS code "natively"
    var params = [];
    var args = [];
    for (var k in scope) {
      params.push(k);
      args.push(scope[k]);
    }
    params.push(code);
    var ctor = function() {
      return Function.apply(this, params);
    };
    ctor.prototype = Function.prototype;
    return new ctor().apply(null, args);
  }
};

/**
 * API for blockly code.
 * @param {app.Scene} scene instance.
 * @param {app.BlockRunner} runner instance.
 * @constructor
 */
app.BlockRunnerApi = function(scene, runner) {
  this.scene = scene;
  this.runner = runner;
};

/**
 * Creates a method function which verifies which guards that the runner is still executing.
 * @param {Function} fn real api method.
 * @return {Function}
 */
app.BlockRunnerApi.createApiMethod = function(fn) {
  return function() {
    if (!this.runner.isTerminated()) {
      fn.apply(this, arguments);
    }
  };
};

app.BlockRunnerApi.prototype = {
  moveNorth: app.BlockRunnerApi.createApiMethod(function(id) {
    this.move_(app.Direction.NORTH, id);
  }),

  moveWest: app.BlockRunnerApi.createApiMethod(function(id) {
    this.move_(app.Direction.WEST, id);
  }),

  moveSouth: app.BlockRunnerApi.createApiMethod(function(id) {
    this.move_(app.Direction.SOUTH, id);
  }),

  moveEast: app.BlockRunnerApi.createApiMethod(function(id) {
    this.move_(app.Direction.EAST, id);
  }),

  highlightLoop: app.BlockRunnerApi.createApiMethod(function(id) {
    this.runner.injectHighlight(id);
  }),

  move_: function(direction, id) {
    var player = this.scene.player;
    var animation = player.move(direction);
    var success = !!animation;

    // Terminate if we hit a tree or map boundary.
    if (!success) {
      this.runner.queueAnimation(player.lose(direction), id);
      this.runner.terminateWithResult(app.ResultType.ERROR);
    } else {
      this.runner.queueAnimation(animation, id);
    }

    var pickedCount = 0;
    for (var present, i = 0; present = this.scene.presents[i]; i++) {
      // Check if we can pick up a new present
      if (present.x === player.x && present.y === player.y) {
        this.runner.queueAnimation(player.pickUp(present));
        pickedCount++;
      }
    }

    // Terminate if we have picked up all presents.
    if (pickedCount === this.scene.presents.length) {
      this.runner.terminateWithResult(app.ResultType.SUCCESS);
    }
  }
};
