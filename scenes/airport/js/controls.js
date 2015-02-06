goog.require('app.Constants');
goog.require('app.InputEvent');

goog.provide('app.Controls');

/**
 * Class for the scenes user controls
 * @param {!Element} el DOM element containing the markup of the item
 * @param {!app.State} state Instance of the game state
 * @constructor
 */
app.Controls = function(el, state) {
  this.$el = $(el);
  this.state = state;

  this.startX = -1;
  this.latestX = -1;
  this.dragging = false;

  this.onDragStart_ = this.onDragStart_.bind(this);
  this.onDragMove_ = this.onDragMove_.bind(this);
  this.onDragEnd_ = this.onDragEnd_.bind(this);
  this.bindEvents_();
};

app.Controls.prototype = {

  /**
   * @private
   */
  updateState_: function(direction) {
    if (direction > 0) {
      this.state.nextState();
    } else if (direction < 0) {
      this.state.previousState();
    } else if (direction === 0) {
      this.state.cycleState();
    }
  },

  /**
   * @private
   */
  onDragEnd_: function(e) {
    if (this.dragging) {
      this.$el.off(app.InputEvent.MOVE, this.onDragMove_);
      this.$el.off(app.InputEvent.END, this.onDragEnd_);
      this.$el.off(app.InputEvent.CANCEL, this.onDragEnd_);

      var direction = Math.min(1, Math.max(-1, this.latestX - this.startX));
      this.updateState_(direction);

      this.dragging = false;

      window.santaApp.fire('sound-trigger', 'airport_lever');
    }
  },

  /**
   * @private
   */
  onDragMove_: function(e) {
    // don't scroll, we're swiping
    e.preventDefault();

    e = app.InputEvent.normalize(e);
    this.latestX = e.clientX;
  },

  /**
   * @private
   */
  onDragStart_: function(e) {
    e = app.InputEvent.normalize(e);

    this.dragging = true;
    this.startX = e.clientX;
    this.latestX = e.clientX;

    this.$el.on(app.InputEvent.MOVE, this.onDragMove_);
    this.$el.on(app.InputEvent.END, this.onDragEnd_);
    this.$el.on(app.InputEvent.CANCEL, this.onDragEnd_);
  },

  /**
   * @private
   */
  bindEvents_: function() {
    this.$el.on(app.InputEvent.START, this.onDragStart_);
  },

  /**
   * Destructor
   */
  destroy: function() {
    this.$el.off();
  }

};
