goog.provide('app.Closet');

/**
 * Class for the machine dressing elves on the conveyor belt
 * @param {Element} el DOM element containing the markup for this component
 * @param {Element} context DOM element containing the scene
 * @param {State} state Instance of the game state
 * @constructor
 */
app.Closet = function(el, context, state) {
  this.state = state;
  this.$el = $(el);
  this.$context = $(context);
  this.$colorables = this.$el.find('.outfit .colorable');
  this.$levers = this.$context.find('.closet-lever');
  this.width = this.$el.width();
  this.removeClassTimer = undefined;
};

app.Closet.prototype = {

  /**
   * @param {BeltItem} item currently in the closet
   */
  flashLights_: function(item) {

    var animationName = app.Constants.CLOSET_DRESS_ANIMATION_NAME;
    animationName = animationName.replace('#{color}', item.color);

    // use part of available distance inside closet for animation
    var duration = this.state.dx() * (this.width - item.width()) * 0.75;

    // adjust for faster speeds
    duration = duration / this.state.timeScale();

    // make sure duration is not 0 so we always get to see the animation
    duration = Math.max(0.2, duration);

    this.$colorables.css({
      animationName: animationName,
      animationDuration: duration + 's'
    });

    var leverDuration = Math.max(1.5, duration);
    this.$levers.css({
      animationDuration: (leverDuration) + 's'
    });

    // animate with class and remove it after timeout (debouce-end if called repeatedly)
    this.$context.addClass('closet--processing');
    clearTimeout(this.removeClassTimer);
    this.removeClassTimer = setTimeout(function() {
       this.$context.removeClass('closet--processing');
    }.bind(this), leverDuration * 1000);
  },

  dress: function(item) {
    this.flashLights_(item);
    item.$el.find('.undressed').css('display', 'none');

    if (this.state.isFastState()) {
      item.$el.find('.crazy').css('display', 'block');
      setTimeout(function() {
        item.startCrazyAnimation();
      }, 100);
    }
    else {
      item.$el.find('.dressed').css('display', 'block');
    }

    window.santaApp.fire('sound-trigger', 'airport_machine');
  },

  undress: function(item) {
    item.$el.find('.undressed').css('display', 'block');
    item.$el.find('.dressed').css('display', 'none');
    item.$el.find('.crazy').css('display', 'none');
    item.stopCrazyAnimation();
  }

};
