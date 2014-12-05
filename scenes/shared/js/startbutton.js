/**
 * Display a start button on top of an element, hiding and calling a callback
 * when it's clicked. Used to start games and user initiate webaudio.
 * @param {HTMLElement} sceneElem The element with key events.
 * @param {HTMLElement} elem The container for the button.
 * @param {Function} callback The function to call when button is pressed.
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
