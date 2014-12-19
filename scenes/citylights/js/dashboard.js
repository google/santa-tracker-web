goog.provide('app.Dashboard');

goog.require('app.Constants');
goog.require('app.PhotoSphere');



/**
 * Main class for the photo sphere dashboard carousel
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} div DOM element containing the carousel.
 * @constructor
 */
app.Dashboard = function(div) {
  this.$el = $(div);
  this.$screens_ = undefined;

  this.currentIndex_ = 0;
  this.numberOfItems_ = undefined;
  this.loadTimer_ = undefined;
  this.paginationPlayer_ = undefined;

  this.previous = this.previous.bind(this);
  this.next = this.next.bind(this);
  this.load = this.load.bind(this);
  this.getSphereAtPosition = this.getSphereAtPosition.bind(this);
};


app.Dashboard.prototype = {

  /**
   * @private
   */
  createItems_: function() {
    this.$screens_ = this.$el.find('.js-screen');

    this.$screens_.each(function() {
      var $sphere = $(this);

      // transform localizedtextNodes to data attributes
      $sphere.data('location', $sphere.find('.location').remove().text());
      $sphere.data('description', $sphere.find('.description').remove().text());

      var url = app.PhotoSphere.staticImageUrl($sphere.data('panoid'),
                                               $sphere.data('heading'),
                                               $sphere.data('pitch'));
      $sphere.find('img').attr('src', url);
      $sphere.find('figcaption').text($sphere.data('location'));
    });

    this.numberOfItems_ = this.$screens_.length;
  },


  /**
   * @private
   * @return {Array}
   */
  getKeyframesForOffset_: function(index, direction) {
    var from = 100 * index;
    var to = from + (-1 * direction * 100);

    return [
      {transform: 'translateX(' + from + '%)'},
      {transform: 'translateX(' + to + '%)'}
    ];
  },

  /**
   * @private
   * @return {HTMLElement}
   */
  getElementAtOffset_: function(offset) {
    return this.$screens_.get(this.getOffsetIndex_(offset));
  },

  /**
   * Used internally to run the carousel animation
   * @private
   * @param {Number} direction Direction integer -1, 0, 1
   */
  transitionInDirection_: function(direction) {
    if (this.paginationPlayer_ && !this.paginationPlayer_.finished) {
      return;
    }

    var startOffset = direction < 0 ? -1 : 0;
    var animations = [];

    for (var i = 0; i < 4; i++) {
      animations[i] = new Animation(
          this.getElementAtOffset_(startOffset + i),
          this.getKeyframesForOffset_(startOffset + i, direction),
          {
            duration: 850,
            fill: 'both',
            easing: app.Constants.EASE_IN_OUT_CIRC
          });
    }

    var animationGroup = new AnimationGroup(animations);
    this.paginationPlayer_ = document.timeline.play(animationGroup);

    this.currentIndex_ = this.getOffsetIndex_(direction);
  },

  /**
   * Modulo operation with support for negative numbers
   * @private
   * @param {Number} n Total available numbers
   * @param {Number} m Number to wrap around
   * @return {Number}
   */
  mod_: function(n, m) {
    return ((m % n) + n) % n;
  },

  /**
   * Returns the item index at the specified offset from currentIndex_
   * @private
   * @param {Number} offset Positive or negative number to offset curret index
   * @return {Number}
   */
  getOffsetIndex_: function(offset) {
    var newIndex = this.currentIndex_ + offset;
    return this.mod_(this.numberOfItems_, this.currentIndex_ + offset);
  },

  /**
   * @private
   */
  destroyPlayer_: function(player) {
    if (this.paginationPlayer_) {
      this.paginationPlayer_.pause();
      this.paginationPlayer_.source = null;
      this.paginationPlayer_ = null;
    }
  },

  /**
   * Return Sphere ID for the specified position
   * @public
   * @param {String} position left, middle or right
   * @return {String}
   */
  getSphereAtPosition: function(position) {
    var positionOffset = app.Constants.POSITION_OFFSET[position];
    var index = this.getOffsetIndex_(positionOffset);
    var $screen = this.$screens_.eq(index);
    return {
      id: $screen.data('panoid'),
      location: $screen.data('location'),
      description: $screen.data('description'),
      pov: {
        heading: $screen.data('heading'),
        pitch: $screen.data('pitch')
      }
    };
  },

  /**
   * Cycle carousel left
   * @public
   */
  previous: function() {
    this.transitionInDirection_(-1);
    window.santaApp.fire('sound-trigger', 'citylights_slide');
  },

  /**
   * Cycle carousel right
   * @public
   */
  next: function() {
    this.transitionInDirection_(1);
    window.santaApp.fire('sound-trigger', 'citylights_slide');
  },

  /**
   * Load the carousel
   * @public
   * @param {Function} callback Called when carousel has finished loading
   */
  load: function(callback) {
    this.createItems_();
    this.transitionInDirection_(0);
    this.loadTimer_ = setTimeout(callback, app.Constants.START_DELAY_MS);
  },

  /**
   * @public
   */
  destroy: function() {
    clearTimeout(this.loadTimer_);
    this.destroyPlayer_();
  }

};
