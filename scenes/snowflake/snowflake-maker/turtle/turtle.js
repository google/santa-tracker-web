/**
 * Blockly Games: Turtle
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
 * @fileoverview JavaScript for Blockly's Turtle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle');

goog.require('BlocklyInterface');
goog.require('Slider');
goog.require('Turtle.Blocks');
goog.require('Turtle.SceneTutorial');
goog.require('Sharing');

Turtle.HEIGHT = 500;
Turtle.WIDTH = 500;
Turtle.DISPLAY_SIZE = 300;
Turtle.SHADOW_OFFSET = 6;

Turtle.DEFAULT_DELAY = 400;
Turtle.FAST_DELAY = 20;

Turtle.MIN_LINE_WIDTH = 6;
Turtle.LINE_SCALE = 10;

/**
 * PID of animation task currently executing.
 * @type !Array.<number>
 */
Turtle.pidList = [];

/**
 * Number of milliseconds that execution should delay.
 * This variable is set by executeChunk to signal when code
 * is done running and should not be used as signal for when the code is
 * being run instantaneously vs at normal speed vs at fast speed. For that, use runDelay.
 * @type number
 */
Turtle.pause = 0;

/**
 * Number of milliseconds that execution should delay between steps.
 * This variable is used to signal whether the code is being run instantaneously,
 * at normal speed, or at a fast speed.
 * @type number
 */
Turtle.runDelay = Turtle.DEFAULT_DELAY;

/**
 * JavaScript interpreter for executing program.
 * @type Interpreter
 */
Turtle.interpreter = null;

/**
 * Should the turtle be drawn?
 * @type boolean
 */
Turtle.visible = true;

/**
 * Are we making the first part of the
 * snowflake or one of the 6 stamped repetitions?
 * @type boolean
 */
Turtle.onRepeat = false;

Turtle.snowflakeStartBlockId = "SnowflakeStartBlock";

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Turtle.init = function() {
  // Restore sounds state.
  var soundsEnabled = true;

  var blocklyDiv = document.getElementById('blocklyDiv');
  var visualization = document.getElementById('visualization');
  window.addEventListener('scroll', function() {
    Blockly.DropDownDiv.hideWithoutAnimation();
  });

  Turtle.workspace = Blockly.inject('blocklyDiv', {
          comments: false,
          disable: true,
          collapse: false,
          media: 'media/',
          readOnly: false,
          rtl: false,
          scrollbars: false,
          toolbox: Turtle.getToolboxElement(),
          trashcan: false,
          horizontalLayout: true,
          toolboxPosition: 'end',
          sounds: soundsEnabled,
          colours: {
            workspace: 'rgba(255,255,0,0)',
            flyout: 'rgba(255,255,0,0)',
          }
  });

  Blockly.Colours.insertionMarker = "#795548";

  // Scratch-blocks is accounting for the size of the flyout in a way that we don't want.
  Turtle.workspace.translate(0,0);
  Turtle.workspace.scrollY = 0;

  Turtle.workspace.addChangeListener(Blockly.Events.disableOrphans);

  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,penUp,penDown,penWidth,penColour');

  Turtle.ctxDisplay = document.getElementById('display').getContext('2d');
  Turtle.ctxScratch = document.getElementById('scratch').getContext('2d');
  Turtle.ctxOutput = document.getElementById('output').getContext('2d');
  Turtle.paper = document.getElementById('paperDiv');

  BlocklyInterface.loadBlocks(Turtle.getDefaultXml(), true);
  Turtle.loadUrlBlocks();


  // Onresize will be called as soon as we register it in IE, so we hold off
  // on registering it until everything it references is defined.
  onresize = function() {
    var totalHeight = document.getElementById('visualization').offsetHeight;
    var totalWidth = document.getElementById('visualization').offsetWidth;
    var paddingHeight = window.innerHeight > 700 ? 80: 40;
    var paddingWidth = 32;
    Turtle.DISPLAY_SIZE = Math.min(
        totalWidth - paddingWidth,
        totalHeight - paddingHeight);
    Turtle.paper.style.height = Turtle.DISPLAY_SIZE + 'px';
    Turtle.paper.style.width = Turtle.DISPLAY_SIZE + 'px';
    document.getElementById('display').height = Turtle.DISPLAY_SIZE;
    document.getElementById('display').width = Turtle.DISPLAY_SIZE;
    Turtle.display();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  window.addEventListener('resize', onresize);
  onresize();
  Turtle.reset();

  Turtle.registerRunListener();
  if (document.getElementById('submitButton')) {
    Turtle.bindClick('submitButton', Turtle.sendSnowflakeAndBlocks);
  }
  Turtle.bindClick('clearWs', BlocklyInterface.clearBlocks);

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);

  //Tutorial
  this.tutorial = new Turtle.SceneTutorial(document.getElementsByClassName('tutorial')[0]);
  this.tutorial.schedule();
};

window.addEventListener('load', Turtle.init);

/**
 * @return {string} XML representation of the default workspace contents, if
 *     not set from the URL.
 */
Turtle.getDefaultXml = function() {
  return '<xml>' +
      '  <block type="snowflake_start" id="SnowflakeStartBlock" deletable="false" movable="false" x="32" y="32">' +
      '    <next>' +
      '      <block type="pentagon_stamp">' +
      '        <value name="SIZE">' +
      '          <shadow type="dropdown_pentagon">' +
      '            <field name="CHOICE">125</field>' +
      '          </shadow>' +
      '        </value>' +
      '        <next>' +
      '          <block type="turtle_colour">' +
      '            <value name="COLOUR">' +
      '              <shadow type="dropdown_colour">' +
      '                <field name="CHOICE">#b3e5fc</field>' +
      '              </shadow>' +
      '            </value>' +
      '            <next>' +
      '              <block type="triangle_stamp">' +
      '                <value name="SIZE">' +
      '                  <shadow type="dropdown_triangle">' +
      '                    <field name="CHOICE">125</field>' +
      '                  </shadow>' +
      '                </value>' +
      '              </block>' +
      '            </next>' +
      '          </block>' +
      '        </next>' +
      '      </block>' +
      '    </next>' +
      '  </block>' +
      '</xml>';
};

Turtle.loadUrlBlocks = function() {
  var blocksString = window.location.search;
  if (blocksString) {
    var index = blocksString.indexOf('B=');
    if (index != -1) {
      blocksString = blocksString.substring(index + 2);
      Sharing.urlToWorkspace(blocksString);
      Turtle.sharing = true;
      Turtle.sendSnowflakeAndBlocks();
    }
  }
};

/**
 * Register a workspace listener to listen for clicks on the starter block and
 * respond by running the user's code.
 */
Turtle.registerRunListener = function() {
  function onBlockClicked(event) {
    if (event.type == Blockly.Events.UI &&
        event.element == 'click' &&
        event.blockId == Turtle.snowflakeStartBlockId) {
      Turtle.runCode(Turtle.DEFAULT_DELAY);
    }
  }
  Turtle.workspace.addChangeListener(onBlockClicked);
};

/**
 * @return {Blockly.Block} The block on the workspace with the snowflake start
 *     block's id, or null if not found.
 */
Turtle.getStarterBlock = function() {
  return Turtle.workspace.getBlockById(Turtle.snowflakeStartBlockId);
};

/**
 * Find the toolbox XML in the page.
 * return {!Element} XML document
 */
Turtle.getToolboxElement = function() {
  return document.getElementById('toolbox');
};

Turtle.resetPosition = function() {
  // Starting location and heading of the turtle.
  Turtle.x = Turtle.HEIGHT / 2;
  Turtle.y = Turtle.WIDTH / 2;
  Turtle.heading = 0;
  Turtle.penDownValue = true;
  Turtle.visible = true;
}

Turtle.resetStyle = function() {
  // TODO (roboerikg): update the color to the final starting color
  Turtle.ctxScratch.strokeStyle = '#29b6f6';
  Turtle.ctxScratch.fillStyle = '#29b6f6';
  Turtle.ctxScratch.lineWidth = 6;
  Turtle.ctxScratch.lineCap = 'round';
  Turtle.ctxScratch.lineJoin = 'round';
}

/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 */
Turtle.reset = function() {
  Turtle.resetPosition();

  // Clear the canvas.
  Turtle.ctxScratch.canvas.width = Turtle.ctxScratch.canvas.width;
  Turtle.resetStyle();

  Turtle.display();

  // Kill all tasks.
  for (var x = 0; x < Turtle.pidList.length; x++) {
    window.clearTimeout(Turtle.pidList[x]);
  }
  Turtle.pidList.length = 0;
  Turtle.interpreter = null;
  Turtle.bounds = null;
};

/**
* Updates the current bounds of the rendered snowflake. Takes in a set of bounds
* for a drawing segment and expands the global bounds if necessary.
*/
Turtle.updateBounds = function(bounds) {
  if (!Turtle.bounds) {
    Turtle.bounds = bounds;
  } else {
    Turtle.bounds[0] = Math.min(Turtle.bounds[0], bounds[0]);
    Turtle.bounds[1] = Math.min(Turtle.bounds[1], bounds[1]);
    Turtle.bounds[2] = Math.max(Turtle.bounds[2], bounds[2]);
    Turtle.bounds[3] = Math.max(Turtle.bounds[3], bounds[3]);
  }
}

/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Turtle.display = function() {

  // Clip the canvas to its rendered size (centered)
  Turtle.ctxDisplay.beginPath();
  Turtle.ctxDisplay.rect(0, 0,
      Turtle.ctxDisplay.canvas.width, Turtle.ctxDisplay.canvas.height);
  Turtle.ctxDisplay.clearRect(0, 0, Turtle.ctxDisplay.canvas.width, Turtle.ctxDisplay.canvas.height);
  Turtle.ctxDisplay.fillStyle = "rgba(0, 0, 255, 0)";
  Turtle.ctxDisplay.fill();

  // Draw the user layer.
  var offset = (Turtle.WIDTH - Turtle.DISPLAY_SIZE) / 2;
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxScratch.canvas, -offset, -offset);

  // Draw the turtle.
  if (Turtle.visible) {
    Turtle.x -= offset;
    Turtle.y -= offset;
    // Make the turtle the colour of the pen.
    Turtle.ctxDisplay.strokeStyle = Turtle.ctxScratch.strokeStyle;
    Turtle.ctxDisplay.fillStyle = Turtle.ctxScratch.fillStyle;

    // Draw the turtle body.
    var radius = Turtle.ctxScratch.lineWidth / 2 + 10;
    Turtle.ctxDisplay.beginPath();
    Turtle.ctxDisplay.arc(Turtle.x, Turtle.y, radius, 0, 2 * Math.PI, false);
    Turtle.ctxDisplay.lineWidth = 3;
    Turtle.ctxDisplay.stroke();

    // Draw the turtle head.
    var WIDTH = 0.3;
    var HEAD_TIP = 10;
    var ARROW_TIP = 4;
    var BEND = 6;
    var radians = 2 * Math.PI * Turtle.heading / 360;
    var tipX = Turtle.x + (radius + HEAD_TIP) * Math.sin(radians);
    var tipY = Turtle.y - (radius + HEAD_TIP) * Math.cos(radians);
    radians -= WIDTH;
    var leftX = Turtle.x + (radius + ARROW_TIP) * Math.sin(radians);
    var leftY = Turtle.y - (radius + ARROW_TIP) * Math.cos(radians);
    radians += WIDTH / 2;
    var leftControlX = Turtle.x + (radius + BEND) * Math.sin(radians);
    var leftControlY = Turtle.y - (radius + BEND) * Math.cos(radians);
    radians += WIDTH;
    var rightControlX = Turtle.x + (radius + BEND) * Math.sin(radians);
    var rightControlY = Turtle.y - (radius + BEND) * Math.cos(radians);
    radians += WIDTH / 2;
    var rightX = Turtle.x + (radius + ARROW_TIP) * Math.sin(radians);
    var rightY = Turtle.y - (radius + ARROW_TIP) * Math.cos(radians);
    Turtle.ctxDisplay.beginPath();
    Turtle.ctxDisplay.moveTo(tipX, tipY);
    Turtle.ctxDisplay.lineTo(leftX, leftY);
    Turtle.ctxDisplay.bezierCurveTo(leftControlX, leftControlY,
        rightControlX, rightControlY, rightX, rightY);
    Turtle.ctxDisplay.closePath();
    Turtle.ctxDisplay.fill();

    Turtle.x += offset;
    Turtle.y += offset;
  }
};

Turtle.runCode = function(delay, callback) {
  Turtle.runDelay = delay;
  Turtle.reset();
  Turtle.canSubmit = false;
  Turtle.execute(callback);
};

/**
 * Inject the Turtle API into a JavaScript interpreter.
 * @param {!Object} scope Global scope.
 * @param {!Interpreter} interpreter The JS interpreter.
 */
Turtle.initInterpreter = function(interpreter, scope) {
  // API
  /** wrap functions in the Turtle object so that they
  can be called from the blocks' javascript generator functions. */
  var wrapper;

  wrapper = function(time) {
    Turtle.pause = time;
  };
  interpreter.setProperty(scope, 'pause', interpreter.createNativeFunction(wrapper));

  wrapper = function(bool) {
    Turtle.setOnRepeat(bool);
  };
  interpreter.setProperty(scope, 'setOnRepeat', interpreter.createNativeFunction(wrapper));

  wrapper = function(bool) {
    Turtle.showRepeatMessage(bool);
  };
  interpreter.setProperty(scope, 'showRepeatMessage', interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Turtle.stampPolygon(size, 5, true /*animate*/, false /*fill*/, id.toString());
  };
  interpreter.setProperty(scope, 'stampPentagon',
        interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Turtle.stampDiamond(size, false /*fill*/, id.toString());
  };
  interpreter.setProperty(scope, 'stampDiamond',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Turtle.stampPolygon(size, 4, true /*animate*/, false /*fill*/, id.toString());
  };
  interpreter.setProperty(scope, 'stampSquare',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(size, id) {
    Turtle.stampPolygon(size, 3, true /*animate*/, false /*fill*/, id.toString());
  };
  interpreter.setProperty(scope, 'stampTriangle',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    Turtle.resetPosition();
    Turtle.resetStyle();
  };
  interpreter.setProperty(scope, 'reset',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(distance, id) {
    Turtle.move(distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(distance, id) {
    Turtle.move(-distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveBackward',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(angle, id) {
    Turtle.turn(angle.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turnRight',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(angle, id) {
    Turtle.turn(-angle.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turnLeft',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour, id) {
    Turtle.penColour(colour.toString(), id.toString());
  };
  interpreter.setProperty(scope, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(id) {
    Turtle.isVisible(false, id.toString());
  };
  interpreter.setProperty(scope, 'hideTurtle',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Turtle.isVisible(true, id.toString());
  };
  interpreter.setProperty(scope, 'showTurtle',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Turtle.execute = function(callback) {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Turtle.execute, 250, callback);
    return;
  }

  Turtle.reset();
  var subcode = Blockly.JavaScript.workspaceToCode(Turtle.workspace);
  var loopVar = 'snowflakeLoopCount'

  var code = 'setOnRepeat(false);\n' +
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' <  6; ' + loopVar + '++) {\n' +
      'pause(' + Turtle.runDelay + ');\n' +
      subcode +
      'if (' + loopVar + ' == 1) { showRepeatMessage(true);\n }\n';
  if (Turtle.runDelay > 0) {
    code += 'if (' + loopVar + ' == 0) { pause(500); }\n';
  }
  code +='setOnRepeat(true);\n' +
      'reset();\nturnRight(60*(' +
      loopVar + '+1), \'no-block-id\');\n}\n' +
      'showRepeatMessage(false)\n';
  Turtle.interpreter = new Interpreter(code, Turtle.initInterpreter);
  Turtle.pidList.push(setTimeout(Turtle.executeChunk_, 100, callback));
};

/**
 * Execute a bite-sized chunk of the user's code.
 * @private
 */
Turtle.executeChunk_ = function(callback) {
  // All tasks should be complete now.  Clean up the PID list.
  Turtle.pidList.length = 0;
  Turtle.pause = 0;
  var go;
  do {
    try {
      go = Turtle.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      // Except if the error involved making a deleted block glow,
      // in which case just keep going.
      if (e != 'Tried to glow block that does not exist.') {
        alert(e);
        go = false;
      }
    }
    if (go && Turtle.pause) {
      // The last executed command requested a pause.
      go = false;
      Turtle.pidList.push(setTimeout(Turtle.executeChunk_, Turtle.pause, callback));
    }
  } while (go);
  // Wrap up if complete.
  if (!Turtle.pause) {
    BlocklyInterface.highlight(null);
    // Image complete; allow the user to submit this image to Reddit.
    Turtle.canSubmit = true;
    if (callback) {
      callback();
    }
  }
};

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
Turtle.animate = function(id) {
  Turtle.display();
  if (id != 'no-block-id' && !Turtle.onRepeat) {
    BlocklyInterface.highlight(id);
    Turtle.pause = Turtle.runDelay;
  } else if (Turtle.onRepeat) {
    BlocklyInterface.highlight(null);
  }
  if (Turtle.onRepeat || Turtle.sharing) {
    Turtle.pause = 0;
  }
};

Turtle.setOnRepeat = function(bool) {
  Turtle.onRepeat = bool.data;
}

/**
 * Set the visibility of the "now repeat" message.
 */
Turtle.showRepeatMessage = function(bool) {
  document.getElementById('now_repeat_message').style.display = bool.data ?
      'block' : 'none';
};

Turtle.stampPolygon = function(size, numSides, animate, fill, id) {
  Turtle.ctxScratch.lineWidth = Turtle.MIN_LINE_WIDTH;
  var sideLen;
  var bounds = [Turtle.x, Turtle.y, Turtle.x, Turtle.y]; // [minx, miny, maxx, maxy]
  switch(numSides) {
    case 4:
      sideLen = size;
      break;
    case 5:
      sideLen = size * 0.64984; // ratio of side to height for a pentagon
      break;
    default:
      // 2/sqrt(3)=1.1547 is the side of a triangle relative to its height
      sideLen = size * 1.1547;
      break;
  }
  Turtle.ctxScratch.beginPath();
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  Turtle.turnWithoutAnimation(-90);
  Turtle.drawLineWithoutMoving(sideLen / 2, !fill /*trace*/);
  bounds = [Math.min(bounds[0], Turtle.x), Math.min(bounds[1], Turtle.y),
            Math.max(bounds[2], Turtle.x), Math.max(bounds[3], Turtle.y)];
  for (var i = 0; i < numSides - 1; i++) {
    Turtle.turnWithoutAnimation(360 / numSides);
    Turtle.drawLineWithoutMoving(sideLen, !fill);
    bounds = [Math.min(bounds[0], Turtle.x), Math.min(bounds[1], Turtle.y),
              Math.max(bounds[2], Turtle.x), Math.max(bounds[3], Turtle.y)];
  }
  Turtle.turnWithoutAnimation(360/numSides);
  Turtle.drawLineWithoutMoving(sideLen / 2, !fill);
  bounds = [Math.min(bounds[0], Turtle.x), Math.min(bounds[1], Turtle.y),
            Math.max(bounds[2], Turtle.x), Math.max(bounds[3], Turtle.y)];
  Turtle.turnWithoutAnimation(90);
  Turtle.ctxScratch.closePath();
  if (fill) {
    Turtle.ctxScratch.fill();
  }
  if (animate) {
    Turtle.animate(id);
  }
  Turtle.updateBounds(bounds);
}

Turtle.stampDiamond = function(size, fill, id) {
  Turtle.turnWithoutAnimation(45);
  Turtle.stampPolygon(size, 4, false /*animate*/, fill, id);
  Turtle.turnWithoutAnimation(45);
  Turtle.animate(id);
};

Turtle.drawLineWithoutMoving = function(distance, trace) {
  if (Turtle.penDownValue && trace) {
    Turtle.ctxScratch.beginPath();
    Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  }
  if (distance) {
    Turtle.x += distance * Math.sin(2 * Math.PI * Turtle.heading / 360);
    Turtle.y -= distance * Math.cos(2 * Math.PI * Turtle.heading / 360);
    var bump = 0;
  } else {
    // WebKit (unlike Gecko) draws nothing for a zero-length line.
    var bump = 0.1;
  }
  if (Turtle.penDownValue) {
    Turtle.ctxScratch.lineTo(Turtle.x, Turtle.y + bump);
    if (trace) {
      Turtle.ctxScratch.stroke();
    }
  }
};

Turtle.turnWithoutAnimation = function(angle) {
  Turtle.heading += angle;
  Turtle.heading %= 360;
  if (Turtle.heading < 0) {
    Turtle.heading += 360;
  }
};

/**
 * Move the turtle forward or backward.
 * @param {number} distance Pixels to move.
 * @param {?string} id ID of block.
 */
Turtle.move = function(distance, id) {
  if (distance) {
    Turtle.x += distance * Math.sin(2 * Math.PI * Turtle.heading / 360);
    Turtle.y -= distance * Math.cos(2 * Math.PI * Turtle.heading / 360);
    var bump = 0;
  } else {
    // WebKit (unlike Gecko) draws nothing for a zero-length line.
    var bump = 0.1;
  }
  Turtle.animate(id);
};

/**
 * Turn the turtle left or right.
 * @param {number} angle Degrees to turn clockwise.
 * @param {?string} id ID of block.
 */
Turtle.turn = function(angle, id) {
  Turtle.heading += angle;
  Turtle.heading %= 360;
  if (Turtle.heading < 0) {
    Turtle.heading += 360;
  }
  Turtle.animate(id);
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 * @param {?string} id ID of block.
 */
Turtle.penColour = function(colour, id) {
  Turtle.ctxScratch.strokeStyle = colour;
  Turtle.ctxScratch.fillStyle = colour;
  Turtle.animate(id);
};

/**
 * Make the turtle visible or invisible.
 * @param {boolean} visible True if visible, false if invisible.
 * @param {?string} id ID of block.
 */
Turtle.isVisible = function(visible, id) {
  Turtle.visible = visible;
  Turtle.animate(id);
};

Turtle.sendSnowflakeAndBlocks = function() {
    var delay = Turtle.sharing ? 0 : Turtle.FAST_DELAY;
    Turtle.runCode(delay, function() {
      var blocksUrl = Sharing.workspaceToUrl();
      if (!blocksUrl || blocksUrl == "") {
        console.log('Workspace has no code.');
        Turtle.sharing = false;
        return;
      }
      var padding = Turtle.ctxScratch.lineWidth;
      // We always want a square image, so use the min of x and y for both.
      var min = Math.min(Turtle.bounds[0], Turtle.bounds[1]) - padding;
      // Restrict the min to between 0 and 150
      min = Math.min(150, Math.max(0, min));
      // Similarly, max should use the max of x and y
      var max = Math.max(Turtle.bounds[2], Turtle.bounds[3]) + padding;
      // And restrict to between 350 and WIDTH
      var max = Math.max(350, Math.min(Turtle.WIDTH, max));

      var width = (max - min) + Turtle.SHADOW_OFFSET;
      var height = width;
      Turtle.ctxOutput.canvas.width = width;
      Turtle.ctxOutput.canvas.height = height;
      Turtle.ctxOutput.globalCompositeOperation = 'source-over';
      Turtle.ctxOutput.shadowBlur = 0;
      Turtle.ctxOutput.shadowOffsetX = Turtle.SHADOW_OFFSET;
      Turtle.ctxOutput.shadowOffsetY = Turtle.SHADOW_OFFSET;
      Turtle.ctxOutput.shadowColor = "rgba(0,0,0,0.06)";
      Turtle.ctxOutput.drawImage(Turtle.ctxScratch.canvas, -min, -min);

      parent.postMessage({'sharing': Turtle.sharing, 'blocks': Sharing.workspaceToUrl(),
          'snowflake': Turtle.ctxOutput.canvas.toDataURL('image/png', 1)}, "*");
      //Once we've sent the shared snowflake, if the user hits the back button, we're not in the sharing state anymore.
      if (Turtle.sharing){ Turtle.sharing = false; }
    });
};

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Turtle.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

Turtle.onFirstClicked = function(event) {
  if (event.type == Blockly.Events.UI && event.element == 'click') {
    var block = Turtle.workspace.getBlockById(event.blockId);
    if (block && block.type == 'snowflake_start') {
      Turtle.runButtonClick(event);
    }
  }
};
