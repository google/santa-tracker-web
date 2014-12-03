/**
 * Display a start button on top of an element, hiding and calling a callback
 * when it's clicked. Used to start games and user initiate webaudio.
 * @param {HTMLElement} elem The container for the button.
 * @param {Function} callback The function to call when button is pressed.
 */
function startButton(elem, callback) {
  var button = $('<div class="start"><div class="start-button"></div></div>');
  $(elem).append(button);
  button.find('.start-button').on('mouseenter', function() {
    window.santaApp.fire('sound-trigger', 'generic_button_over');
  });
  button.one('click', function() {
    $(window).off('.startbutton');
    window.santaApp.fire('sound-trigger', 'generic_button_click');
    callback();
    button.remove();
  });
  $(window).on('keydown.startbutton', function(event) {
    if (event.keyCode === 13) {
      button.trigger('click');
    }
  });
}
