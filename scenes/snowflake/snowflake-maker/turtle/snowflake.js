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
 * @fileoverview JavaScript for the coding screen for SantaTracker's Code a Snowflake game.
 * @author madeeha@google.com (Madeeha Ghori)
 */
'use strict';

goog.provide('Snowflake');

goog.require('BlocklyInterface');
goog.require('Snowflake.Blocks');
goog.require('Snowflake.Tutorial');
goog.require('Snowflake.Storage');
goog.require('Snowflake.Sharing');
goog.require('Snowflake.Execute');
goog.require('Snowflake.Display');

Snowflake.bounds = [0, 0, 0, 0];

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Snowflake.init = function() {
  Snowflake.display = new Snowflake.Display();

  Snowflake.Execute.reset();

  Snowflake.registerRunListener();
  Snowflake.registerStorageListener();

  if (document.getElementById('submitButton')) {
    Snowflake.bindClick('submitButton', function() {
      // Don't show the repeat message on this fast run, or on following runs.
      Snowflake.Execute.runCount = Snowflake.Execute.RUN_COUNT_THRESHOLD;
      Snowflake.sendSnowflakeAndBlocks();
    });
  }
  if (document.getElementById('playButton')) {
    Snowflake.bindClick('playButton',
      function() {
        Snowflake.Execute.runCode(Snowflake.Execute.DEFAULT_DELAY, Snowflake.display.maybeShowTutorialWrapper);
        parent.postMessage({'msg-type': 'updateURL', 'blocks': Snowflake.Sharing.workspaceToUrl()}, '*');
      });
  }

  // Lazy-load the JavaScript interpreter.
  setTimeout(BlocklyInterface.importInterpreter, 1);
  Blockly.Events.disable();
  BlocklyInterface.loadBlocks(Snowflake.getDefaultXml(), true);
  Blockly.Events.enable();
  // Try to load blocks from the URL. If that fails, try to restore the workspace from storage.
  // If both fail, assume it's their first time here.  Show and run the default blocks,
  // then show the tutorial.
  if (!Snowflake.loadUrlBlocks() && !Snowflake.storage.restoreWorkspace(Snowflake.workspace)) {
    if (Snowflake.Display.ENABLE_CODE_SNOWFLAKE_MESSAGE) {
      document.getElementById('snowflake_code_message').style.display = 'block';
    }

    Snowflake.Execute.runCode(Snowflake.Execute.DEFAULT_DELAY, Snowflake.display.maybeShowTutorialWrapper);
  } else {
    // Turn on the tutorial, so that it will be visible when the users gets here
    // from the sharing landing page.
    Snowflake.display.tutorial.schedule();
    Snowflake.display.hasShownTutorial = true;
  }
};

//Sets up event listener. Must sit here so that it is called after Snowflake.init is created.
window.addEventListener('load', Snowflake.init);

/**
 * @return {string} XML representation of the default workspace contents, if
 *     not set from the URL.
 */
Snowflake.getDefaultXml = function() {
  return '<xml>' +
      '  <block type="snowflake_start" id="SnowflakeStartBlock" deletable="false" movable="false" x="32" y="32">' +
      '    <next>' +
      '      <block type="turtle_colour">' +
      '        <value name="COLOUR">' +
      '          <shadow type="dropdown_colour">' +
      '            <field name="CHOICE">#b3e5fc</field>' +
      '          </shadow>' +
      '        </value>' +
      '        <next>' +
      '          <block type="pentagon_stamp">' +
      '            <value name="SIZE">' +
      '              <shadow type="dropdown_pentagon">' +
      '                <field name="CHOICE">100</field>' +
      '              </shadow>' +
      '            </value>' +
      '          </block>' +
      '        </next>' +
      '      </block>' +
      '    </next>' +
      '  </block>' +
      '</xml>';
};

/**
 * Try to load blocks from the URL.
 * @return {boolean} whether blocks were successfully loaded.
 */
Snowflake.loadUrlBlocks = function() {
  var blocksString = window.location.search;
  if (blocksString) {
    var index = blocksString.indexOf('B=');
    if (index != -1) {
      blocksString = blocksString.substring(index + 2);
      Blockly.Events.disable();
      Snowflake.Sharing.urlToWorkspace(blocksString);
      Blockly.Events.enable();
      Snowflake.sharing = true;
      Snowflake.sendSnowflakeAndBlocks();
      return true;
    }
  }
  return false;
};

/**
 * Register a workspace listener to listen for clicks on the starter block and
 * respond by running the user's code.
 */
Snowflake.registerRunListener = function() {
  function onBlockSelected(event) {
    if (event.type == Blockly.Events.UI &&
        event.element == 'selected' &&
        event.newValue == BlocklyInterface.snowflakeStartBlockId) {
      // Deselect the start block--otherwise it won't register the next tap.
      // This is a workaround because immovable blocks don't fire click events.
      Snowflake.workspace.getBlockById(BlocklyInterface.snowflakeStartBlockId).unselect();
      Snowflake.Execute.runCode(Snowflake.Execute.DEFAULT_DELAY, Snowflake.display.maybeShowTutorialWrapper);
      parent.postMessage({'msg-type':'updateURL', 'blocks': Snowflake.Sharing.workspaceToUrl()}, '*');
    }
  }
  Snowflake.workspace.addChangeListener(onBlockSelected);
};

/**
 * Register a workspace listener to listen for changes to the workspace and
 * respond by storing the user's code.
 */
Snowflake.registerStorageListener = function() {
  Snowflake.storage = new Snowflake.Storage();
  function onWorkspaceChanged(event) {
    if (event.type != Blockly.Events.UI) {
      Snowflake.storage.storeWorkspace(Snowflake.workspace);
    }
  }
  Snowflake.workspace.addChangeListener(onWorkspaceChanged);
};

/**
 * Make the turtle visible or invisible.
 * @param {boolean} visible True if visible, false if invisible.
 * @param {?string} id ID of block.
 */
Snowflake.isVisible = function(visible, id) {
  Snowflake.Execute.visible = visible;
  Snowflake.Execute.animate(id);
};

Snowflake.sendSnowflakeAndBlocks = function() {
    var delay = Snowflake.sharing ? 0 : Snowflake.Execute.FAST_DELAY;
    Snowflake.Execute.runCode(delay, function() {
      var blocksUrl = Snowflake.Sharing.workspaceToUrl();
      if (!blocksUrl || blocksUrl == "" || (!Snowflake.sharing && Snowflake.boundsAreEmpty())) {
        console.log('Workspace has no drawable code.');
        Snowflake.sharing = false;
        return;
        //TODO(madCode): We should pop a message up here.
      }
      var outputCtx = Snowflake.display.drawSnowflake();

      parent.postMessage({'msg-type': 'updatePage', 'sharing': Snowflake.sharing, 'blocks': Snowflake.Sharing.workspaceToUrl(),
          'snowflake': outputCtx.canvas.toDataURL('image/png', 1)}, '*');
      //Once we've sent the shared snowflake, if the user hits the back button, we're not in the sharing state anymore.
      if (Snowflake.sharing){ Snowflake.sharing = false; }
    });
};

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Snowflake.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

Snowflake.boundsAreEmpty = function() {
  var empty = true;
  for (var i = 0; i < Snowflake.bounds.length; i++) {
    empty = empty && Snowflake.bounds[i] == 0;
  }
  return empty;
}