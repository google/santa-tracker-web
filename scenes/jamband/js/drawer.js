goog.provide('app.Drawer');

/**
 * A drawer to store the instruments in
 *
 * @param {!Element} elem A DOM element which wraps the game.
 * @constructor
 */
app.Drawer = function(elem) {
  this.drawer = elem.find('.Drawer');
  var tab = elem.find('#drawer-tab');
  var scrollable = elem.find('#drawer-scrollable');

  tab.on('mouseup.jamband touchend.jamband', this.toggle.bind(this));

  var scrollToOffset = function(direction) {
    var offset = scrollable.find('.InstrumentContainer:not(.collapse)').first().width() * direction;
    var position = Math.floor((scrollable.scrollLeft() + offset) / offset) * offset;
    scrollable.animate({scrollLeft: position}, {duration: 300});
  };

  elem.find('#drawer-arrow--left').on('click.jamband touchend.jamband', function() {
    scrollToOffset(-1);
  });

  elem.find('#drawer-arrow--right').on('click.jamband touchend.jamband', function() {
    scrollToOffset(1);
  });
};

/**
 * Show or hide the drawer
 */
app.Drawer.prototype.toggle = function() {
  this.drawer.toggleClass('Drawer--hidden');
};
