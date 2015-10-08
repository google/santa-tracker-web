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

/**
 * Display a start button on top of an element, hiding and calling a callback
 * when it's clicked. Used to start games and user initiate webaudio.
 * @param {!Element|!jQuery} sceneElem The element with key events.
 * @param {!Element|!jQuery} elem The container for the button.
 * @param {!Function} callback The function to call when button is pressed.
 */
function startButton(sceneElem, elem, callback) {
  sceneElem = $(sceneElem);
  elem = $(elem);

  var buttonElem = $('<div class="start"><div class="start-button"></div></div>');
  elem.append(buttonElem);

  buttonElem.find('.start-button').on('mouseenter', function() {
    window.santaApp.fire('sound-trigger', 'generic_button_over');
  });
  buttonElem.one('click', function() {
    sceneElem.off('.startbutton');
    window.santaApp.fire('sound-trigger', 'generic_button_click');
    callback();
    buttonElem.remove();
  });
  sceneElem.on('keydown.startbutton', function(event) {
    if (event.keyCode === 13) {
      buttonElem.trigger('click');
    }
  });
}
