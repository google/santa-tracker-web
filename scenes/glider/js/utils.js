goog.provide('app.utils');

/**
 * Restart animation by removing then adding it again.
 */
app.utils.restartAnimation = function() {
  $('.animated').addClass('resizing');
  setTimeout(function() {
    $('.animated').removeClass('resizing');
  }, 100);
};
