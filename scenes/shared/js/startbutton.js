/**
 * Add a start button.
 * @param {HTMLElement} elem The container for the button.
 * @param {Function} callback The function to call when button is pressed.
 */
function startButton(elem, callback) {
  var button = $('<div class="start"><div class="start-button"></div></div>');
  $(elem).append(button);
  button.find('.start-button').on('mouseenter', function() {
    // Klang.triggerEvent('generic_button_over');
  })
  button.one('click', function() {
    // Klang.triggerEvent('generic_button_click');
    callback();
    button.remove();
  })
}
