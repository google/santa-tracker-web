/**
 * Blockly Games: Snowflake
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Executes and runs user's code. Holds javascript definitions for functions controlled by blocks.
 * @author madeeha@google.com (Madeeha Ghori)
 */

goog.provide('Snowflake.Execute');

Snowflake.Execute.DEFAULT_DELAY = 400;
Snowflake.Execute.FAST_DELAY = 20;
/**
 * PID of animation task currently executing.
 * @type !Array.<number>
 */
Snowflake.Execute.pidList = [];

/**
 * Number of milliseconds that execution should delay.
 * This variable is set by executeChunk to signal when code
 * is done running and should not be used as signal for when the code is
 * being run instantaneously vs at normal speed vs at fast speed. For that, use runDelay.
 * @type number
 */
Snowflake.Execute.pause = 0;

/**
 * Number of milliseconds that execution should delay between steps.
 * This variable is used to signal whether the code is being run instantaneously,
 * at normal speed, or at a fast speed.
 * @type number
 */
Snowflake.Execute.runDelay = Snowflake.Execute.DEFAULT_DELAY;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
Snowflake.Execute.interpreter = null;

/**
 * Should the turtle be drawn?
 * @type boolean
 */
Snowflake.Execute.visible = true;

/**
 * Are we making the first part of the
 * snowflake or one of the 6 stamped repetitions?
 * @type boolean
 */
Snowflake.Execute.onRepeat = false;

/**
 * The number of times the user has run their code.  This is used to turn off
 * helper messages when they have run their code a set number of times.
 * This starts at -1 so we can avoid showing it when we run the starter code.
 * @type number
 */
Snowflake.Execute.runCount = -1;

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
Snowflake.Execute.animate = function(id) {
  Snowflake.display.display();
  if (id != 'no-block-id' && !Snowflake.Execute.onRepeat) {
    BlocklyInterface.highlight(id);
    Snowflake.Execute.pause = Snowflake.Execute.runDelay;
  } else if (Snowflake.Execute.onRepeat) {
    BlocklyInterface.highlight(null);
  }
  if (Snowflake.Execute.onRepeat || Snowflake.sharing) {
    Snowflake.Execute.pause = 0;
  }
};

/**
 * Execute the user's code.  Heaven help us...
 */
Snowflake.Execute.execute = function(callback) {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Snowflake.Execute.execute, 250, callback);
    return;
  }

  Snowflake.Execute.reset();
  var subcode = Blockly.JavaScript.workspaceToCode(Snowflake.workspace);
  var loopVar = 'snowflakeLoopCount'

  var code = 'hideRepeatMessage();\n' +
      'setOnRepeat(false);\n' +
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' <  6; ' + loopVar + '++) {\n' +
      'pause(' + Snowflake.Execute.runDelay + ');\n' +
      subcode +
      'if (' + loopVar + ' == 0) { showRepeatMessage();\n }\n';
  if (Snowflake.Execute.runDelay > 0) {
    code += 'if (' + loopVar + ' == 0) { pause(500); }\n';
  }
  code +='setOnRepeat(true);\n' +
      'reset();\nturnRight(60*(' +
      loopVar + '+1), \'no-block-id\');\n}\n' +
      'hideRepeatMessage()\n';
  Snowflake.Execute.interpreter = new Interpreter(code, Snowflake.Execute.initInterpreter);
  Snowflake.Execute.pidList.push(setTimeout(Snowflake.Execute.executeChunk_, 100, callback));
};

/**
 * Execute a bite-sized chunk of the user's code.
 * @private
 */
Snowflake.Execute.executeChunk_ = function(callback) {
  // All tasks should be complete now.  Clean up the PID list.
  Snowflake.Execute.pidList.length = 0;
  Snowflake.Execute.pause = 0;
  var go;
  do {
    try {
      go = Snowflake.Execute.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      // Except if the error involved making a deleted block glow,
      // in which case just keep going.
      if (e != 'Tried to glow block that does not exist.') {
        alert(e);
        go = false;
      }
    }
    if (go && Snowflake.Execute.pause) {
      // The last executed command requested a pause.
      go = false;
      Snowflake.Execute.pidList.push(setTimeout(Snowflake.Execute.executeChunk_, Snowflake.Execute.pause, callback));
    }
  } while (go);
  // Wrap up if complete.
  if (!Snowflake.Execute.pause) {
    BlocklyInterface.highlight(null);
    // Image complete; allow the user to submit this image to Reddit.
    Snowflake.Execute.canSubmit = true;
    if (callback) {
      callback();
    }
  }
};

/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 */
Snowflake.Execute.reset = function() {
  Snowflake.display.resetPosition();

  // Clear the canvas.
  Snowflake.display.ctxScratch.canvas.width = Snowflake.display.ctxScratch.canvas.width;
  Snowflake.display.resetStyle();

  Snowflake.display.display();

  // Kill all tasks.
  for (var x = 0; x < Snowflake.Execute.pidList.length; x++) {
    window.clearTimeout(Snowflake.Execute.pidList[x]);
  }
  Snowflake.Execute.pidList.length = 0;
  Snowflake.Execute.interpreter = null;
  Snowflake.bounds = [0, 0, 0, 0];
};

/**
 * Reset the canvas and run the user's code.
 * @param {number} delay How much we should pause between steps. In miliseconds.
 * @param {function} callback Function to call after we've run the user's code.
 */
Snowflake.Execute.runCode = function(delay, callback) {
  Snowflake.Execute.runDelay = delay;
  Snowflake.Execute.reset();
  Snowflake.Execute.canSubmit = false;
  Snowflake.Execute.execute(callback);
};

/**
 * @param {boolean} bool
 */
Snowflake.Execute.setOnRepeat = function(bool) {
  Snowflake.Execute.onRepeat = bool.data;
};


/**
 * Inject the Snowflake API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Snowflake.Execute.initInterpreter = function(interpreter, scope) {
  // API
  /** wrap functions in the Snowflake object so that they
  can be called from the blocks' javascript generator functions. */
  var wrapper;

  wrapper = function(time) {
    Snowflake.Execute.pause = time;
  };
  interpreter.setProperty(scope, 'pause', interpreter.createNativeFunction(wrapper));

  wrapper = function(bool) {
    Snowflake.Execute.setOnRepeat(bool);
  };
  interpreter.setProperty(scope, 'setOnRepeat', interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    Snowflake.display.showRepeatMessage();
  };
  interpreter.setProperty(scope, 'showRepeatMessage',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    Snowflake.display.hideRepeatMessage();
  };
  interpreter.setProperty(scope, 'hideRepeatMessage',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Snowflake.display.stampPolygon(size, 5, id.toString());
  };
  interpreter.setProperty(scope, 'stampPentagon',
        interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Snowflake.display.stampDiamond(size, id.toString());
  };
  interpreter.setProperty(scope, 'stampDiamond',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Snowflake.display.stampPolygon(size, 4, id.toString());
  };
  interpreter.setProperty(scope, 'stampSquare',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Snowflake.display.stampPolygon(size, 3, id.toString());
  };
  interpreter.setProperty(scope, 'stampTriangle',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    Snowflake.display.resetPosition();
    Snowflake.display.resetStyle();
  };
  interpreter.setProperty(scope, 'reset',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    Snowflake.display.move(distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(distance, id) {
    Snowflake.display.move(-distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveBackward',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(angle, id) {
    Snowflake.display.turn(angle.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turnRight',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(angle, id) {
    Snowflake.display.turn(-angle.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turnLeft',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour, id) {
    Snowflake.display.penColour(colour.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(id) {
    Snowflake.display.isVisible(false, id.toString());
  };
  interpreter.setProperty(scope, 'hideSnowflake',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Snowflake.display.isVisible(true, id.toString());
  };
  interpreter.setProperty(scope, 'showSnowflake',
      interpreter.createNativeFunction(wrapper));
};