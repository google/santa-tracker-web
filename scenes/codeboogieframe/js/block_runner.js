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

goog.provide('app.BlockRunner');
goog.provide('app.BlockRunnerApi');
goog.provide('app.ResultType');

goog.require('app.Step');
goog.require('app.shared.utils');

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
  ANIMATING: 'ANIMATING'
};

/**
 * Runs code from blockly blocks.
 * @param {!app.Scene} scene instance.
 * @param {!app.Blockly} blockly interface to Blockly.
 * @constructor
 */
app.BlockRunner = function(scene, blockly) {
  this.api = new app.BlockRunnerApi(scene, this);
  this.blockly = blockly;
  //this.player = document.timeline.play();
  this.scene = scene;

  // Configure Blockly loops to highlight during iteration.
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '  api.highlightLoop(%1);\n';

  // Register animation events.
  scene.player.addEventListener('step', this.onStep_.bind(this));
  scene.player.addEventListener('finish', this.onFinishAnimations_.bind(this));

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
    //this.player.cancel();
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
      console.warn(e);
    }

    if (this.executeResult === app.ResultType.UNSET) {
      this.executeResult = app.ResultType.ERROR;
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
    }

    // Reset state.
    this.blockly.toggleExecution(false);
    this.state_ = app.BlockRunnerState.NOT_ANIMATING;
    this.lastBlockId_ = null;
  },

  runAnimations_: function() {
    this.beforeAnimations_();

    this.scene.player.start(this.stepQueue);
    this.state_ = app.BlockRunnerState.ANIMATING;
  },

  restartLevel: function() {
    this.beforeAnimations_();

    this.state_ = app.BlockRunnerState.NOT_ANIMATING;
  },

  resetAnimation: function() {
    //this.player.cancel();
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
 * @param {!app.Scene} scene instance.
 * @param {!app.BlockRunner} runner instance.
 * @constructor
 */
app.BlockRunnerApi = function(scene, runner) {
  this.scene = scene;
  this.runner = runner;
};

/**
 * Creates a method function which verifies which guards that the runner is still executing.
 * @param {function} fn real api method.
 * @return {function}
 */
app.BlockRunnerApi.createApiMethod = function(fn) {
  return function() {
    if (!this.runner.isTerminated()) {
      fn.apply(this, arguments);
    }
  };
};

app.BlockRunnerApi.prototype = {
  leftArm: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.LEFT_ARM, id);
  }),

  rightArm: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.RIGHT_ARM, id);
  }),

  leftFoot: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.LEFT_FOOT, id);
  }),

  rightFoot: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.RIGHT_FOOT, id);
  }),

  jump: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.JUMP, id);
  }),

  spin: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.SPIN, id);
  }),

  split: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.SPLIT, id);
  }),

  clap: app.BlockRunnerApi.createApiMethod(function(id) {
    this.dance_(app.Step.CLAP, id);
  }),

  highlightLoop: app.BlockRunnerApi.createApiMethod(function(id) {
    this.runner.injectHighlight(id);
  }),

  dance_: function(step, id) {
    //var player = this.scene.player;
    //var success = player.queueStep(step);
    //var success = !!animation;
    //
    //// Terminate if we perform a wrong move.
    //if (!success) {
    //  this.runner.terminateWithResult(app.ResultType.ERROR);
    //}
  }
};
