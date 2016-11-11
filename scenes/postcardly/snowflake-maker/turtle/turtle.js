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

Turtle.HEIGHT = 300;
Turtle.WIDTH = 300;

/**
 * PID of animation task currently executing.
 * @type !Array.<number>
 */
Turtle.pidList = [];

/**
 * Number of milliseconds that execution should delay.
 * @type number
 */
Turtle.pause = 0;

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
 * Is the drawing ready to be submitted to Reddit?
 * @type boolean
 */
Turtle.canSubmit = false;

Turtle.isRTL = false;

Turtle.onRepeat = false;

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Turtle.init = function() {
  // Restore sounds state.
  var soundsEnabled = true;

  // Setup blocks
  // Parse the URL arguments.
  var match = location.search.match(/dir=([^&]+)/);
  var rtl = match && match[1] == 'rtl';
  var toolbox = Turtle.getToolboxElement();
  match = location.search.match(/side=([^&]+)/);
  var side = match ? match[1] : 'start';

  var rtl = Turtle.isRTL;
  var blocklyDiv = document.getElementById('blocklyDiv');
  var visualization = document.getElementById('visualization');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    //TODO(madeeha): Calculating this wasn't producing desired results. Look at math again.
    blocklyDiv.style.width = '1000px';
    //calculate the size of the main workspace and figure out where to place the starter blocks
    if (Turtle.workspace) {
      var starterBlock = Turtle.getStarterBlock();
      var workspaceHeight = blocklyDiv.clientHeight;
      starterBlock.x = 0;
      starterBlock.y = workspaceHeight/2;
    }
  };
  window.addEventListener('scroll', function() {
    onresize();
    Blockly.svgResize(Turtle.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize();

  var toolbox = Turtle.getToolboxElement();

  Turtle.workspace = Blockly.inject('blocklyDiv', {
          comments: false,
          disable: true,
          collapse: false,
          media: 'media/',
          readOnly: false,
          rtl: rtl,
          scrollbars: false,
          toolbox: toolbox,
          trashcan: false,
          horizontalLayout: true,
          toolboxPosition: 'end',
          sounds: soundsEnabled,
          colours: {
            workspace: 'rgba(255,255,0,0)',
            flyout: 'rgba(255,255,0,0)',
          }
  });

  Blockly.getMainWorkspace().addChangeListener(Blockly.Events.disableOrphans);
  
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,penUp,penDown,penWidth,penColour');

  //TODO(madCode): We could calculate the x and y coordinates here on resize? Not sure it works that way, tbh.

  var workspaceHeight = blocklyDiv.clientHeight;

  var defaultXml = '<xml><block type="snowflake_start" deletable="false" movable="false" x="0" y=\"' + workspaceHeight*0.6 + '\"><next><block type="copy_to_make_snowflake" deletable="false" movable="false"></block></next></block></xml>';
  
  BlocklyInterface.loadBlocks(defaultXml, true);

  Turtle.ctxDisplay = document.getElementById('display').getContext('2d');
  Turtle.ctxScratch = document.getElementById('scratch').getContext('2d');
  Turtle.reset();

  Turtle.bindClick('runButton', Turtle.runButtonClick);
  Turtle.bindClick('resetButton', Turtle.resetButtonClick);
  if (document.getElementById('submitButton')) {
    Turtle.bindClick('submitButton', Turtle.getImageAsDataURL);
  }


  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);

  //Tutorial
  this.tutorial = new Turtle.SceneTutorial(document.getElementsByClassName('tutorial')[0]);
  this.tutorial.schedule();
};

window.addEventListener('load', Turtle.init);

Turtle.getStarterBlock = function(topBlocksList) {
  for (var i = 0; i < topBlocksList.length; i++) {
    if (topBlocksList[i]. type == "snowflake_start") {
      return topBlockList[i];
    }
  }
};

//TODO(madCode): make this center the start block on the screen.
Turtle.centerStartBlock = function() {
};

Turtle.getToolboxElement = function() {
  var match = location.search.match(/toolbox=([^&]+)/);
  return document.getElementById('toolbox-' + (match ? match[1] : 'categories'));
};


/**
 * Flag indicating if a toolbox categoriy has been clicked yet.
 * Level one only.
 * @private
 */
Turtle.categoryClicked_ = false;

/**
 * Monitor to see if the user finds the categories in level one.
 * @param {!Blockly.Events.Abstract} e Custom data for event.
 * @private
 */
Turtle.watchCategories_ = function(e) {
  if (e.type == Blockly.Events.UI && e.element == 'category') {
    Turtle.categoryClicked_ = true;
    //BlocklyDialogs.hideDialog(false);
    Turtle.workspace.removeChangeListener(Turtle.watchCategories_);
  }
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
  Turtle.ctxScratch.strokeStyle = '#ffffff';
  Turtle.ctxScratch.fillStyle = '#ffffff';
  Turtle.ctxScratch.lineWidth = 5;
  Turtle.ctxScratch.lineCap = 'round';
  Turtle.ctxScratch.font = 'normal 18pt Arial';
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
};

/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Turtle.display = function() {
  // Clear the display with black.
  Turtle.ctxDisplay.beginPath();
  Turtle.ctxDisplay.rect(0, 0,
      Turtle.ctxDisplay.canvas.width, Turtle.ctxDisplay.canvas.height);
  Turtle.ctxDisplay.fillStyle = '#000000';
  Turtle.ctxDisplay.fill();

  // Draw the user layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (Turtle.visible) {
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
  }
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Turtle.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  document.getElementById('spinner').style.visibility = 'visible';
  Turtle.workspace.traceOn(true);
  Turtle.execute();
};

/**
 * Click the reset button.  Reset the Turtle.
 * @param {!Event} e Mouse or touch event.
 */
Turtle.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('runButton');
  runButton.style.display = 'inline';
  document.getElementById('resetButton').style.display = 'none';
  document.getElementById('spinner').style.visibility = 'hidden';
  Turtle.workspace.traceOn(false);
  Turtle.reset();

  // Image cleared; prevent user from moving on to snowflake.
  Turtle.canSubmit = false;
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

  wrapper = function(distance, id) {
    Turtle.drawAndMove(distance.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'moveForwardAndDraw',
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

  wrapper = function(id) {
    Turtle.penDown(false, id.toString());
  };
  interpreter.setProperty(scope, 'penUp',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Turtle.penDown(true, id.toString());
  };
  interpreter.setProperty(scope, 'penDown',
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
Turtle.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Turtle.execute, 250);
    return;
  }

  Turtle.reset();
  var code = Blockly.JavaScript.workspaceToCode(Turtle.workspace);
  Turtle.interpreter = new Interpreter(code, Turtle.initInterpreter);
  Turtle.pidList.push(setTimeout(Turtle.executeChunk_, 100));
};

/**
 * Execute a bite-sized chunk of the user's code.
 * @private
 */
Turtle.executeChunk_ = function() {
  // All tasks should be complete now.  Clean up the PID list.
  Turtle.pidList.length = 0;
  Turtle.pause = 0;
  var go;
  do {
    try {
      go = Turtle.interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
    if (go && Turtle.pause) {
      // The last executed command requested a pause.
      go = false;
      Turtle.pidList.push(
          setTimeout(Turtle.executeChunk_, Turtle.pause));
    }
  } while (go);
  // Wrap up if complete.
  if (!Turtle.pause) {
    document.getElementById('spinner').style.visibility = 'hidden';
    BlocklyInterface.highlight(null);
    // Image complete; allow the user to submit this image to Reddit.
    Turtle.canSubmit = true;
  }
};

/**
 * Highlight a block and pause.
 * @param {?string} id ID of block.
 */
Turtle.animate = function(id) {
  Turtle.display();
  if (id) {
    BlocklyInterface.highlight(id);
    var speed;
    if (!Turtle.onRepeat) {
      speed = 0.3;
    } else {
    // Scale the speed non-linearly, to give better precision at the fast end.
      speed = 0.8;
    }
    Turtle.pause = Math.max(1, 1000 * Math.pow(1 - speed, 2));
  }
};

Turtle.setOnRepeat = function(bool) {
  Turtle.onRepeat = bool.data;
}

Turtle.stampPolygon = function(size, numSides, animate, fill, id) {
  var sideLen;
  switch(numSides) {
    case 4:
      sideLen = size;
      break;
    case 5:
      sideLen = 2*size*Math.sin(Math.PI/numSides)/(Math.cos(Math.PI/numSides) + 1);    
      break;
    default:
      sideLen = size * 1.1547;
      break;
  }
  Turtle.ctxScratch.beginPath();
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  Turtle.turnWithoutAnimation(-90);
  Turtle.drawLineWithoutMoving(sideLen / 2, !fill /*trace*/);
  for (var i = 0; i < numSides - 1; i++) {
    Turtle.turnWithoutAnimation(360 / numSides);
    Turtle.drawLineWithoutMoving(sideLen, !fill);
  }
  Turtle.turnWithoutAnimation(360/numSides);
  Turtle.drawLineWithoutMoving(sideLen / 2, !fill);
  Turtle.turnWithoutAnimation(90);
  Turtle.ctxScratch.closePath();
  if (fill) {
    Turtle.ctxScratch.fill();
  }
  if (animate) {
    Turtle.animate(id);
  }
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
Turtle.drawAndMove = function(distance, id) {
  Turtle.ctxScratch.beginPath();
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  if (distance) {
    Turtle.x += distance * Math.sin(2 * Math.PI * Turtle.heading / 360);
    Turtle.y -= distance * Math.cos(2 * Math.PI * Turtle.heading / 360);
    var bump = 0;
  } else {
    // WebKit (unlike Gecko) draws nothing for a zero-length line.
    var bump = 0.1;
  }
  Turtle.ctxScratch.lineTo(Turtle.x, Turtle.y + bump);
  Turtle.ctxScratch.stroke();
  Turtle.animate(id);
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
 * Lift or lower the pen.
 * @param {boolean} down True if down, false if up.
 * @param {?string} id ID of block.
 */
Turtle.penDown = function(down, id) {
  Turtle.penDownValue = down;
  Turtle.animate(id);
};

/**
 * Change the thickness of lines.
 * @param {number} width New thickness in pixels.
 * @param {?string} id ID of block.
 */
Turtle.penWidth = function(width, id) {
  Turtle.ctxScratch.lineWidth = width;
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

/**
 * Print some text.
 * @param {string} text Text to print.
 * @param {?string} id ID of block.
 */
Turtle.drawPrint = function(text, id) {
  Turtle.ctxScratch.save();
  Turtle.ctxScratch.translate(Turtle.x, Turtle.y);
  Turtle.ctxScratch.rotate(2 * Math.PI * (Turtle.heading - 90) / 360);
  Turtle.ctxScratch.fillText(text, 0, 0);
  Turtle.ctxScratch.restore();
  Turtle.animate(id);
};

/**
 * Change the typeface of printed text.
 * @param {string} font Font name (e.g. 'Arial').
 * @param {number} size Font size (e.g. 18).
 * @param {string} style Font style (e.g. 'italic').
 * @param {?string} id ID of block.
 */
Turtle.drawFont = function(font, size, style, id) {
  Turtle.ctxScratch.font = style + ' ' + size + 'pt ' + font;
  Turtle.animate(id);
};

Turtle.getImageAsDataURL = function() {
  if (Turtle.canSubmit) {
    parent.postMessage(Turtle.ctxScratch.canvas.toDataURL(), "*");    
  }
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
