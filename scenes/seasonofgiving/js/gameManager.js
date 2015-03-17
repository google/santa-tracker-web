goog.provide('app.GameManager');

/**
 * Game manager used for global storage
 */
app.GameManager = {
  color: '#f06',
  currentCanvas: null,
  currentIndex: 0,
  currentOrnament: null,
  gallery: null,
  ie: null,
  ios: null,
  lastOrnament: null,
  lastOrnamentObj: null,
  mobileSlider: null,
  ornaments: [],
  sizeSlider: null,
  tool: null,
  toolWrapper: null,
  totalOrnament: 0,

  dispose: function() {
    this.color = null;
    this.currentCanvas = null;
    this.currentIndex = null;
    this.currentOrnament = null;
    this.gallery = null;
    this.ie = null;
    this.ios = null;
    this.lastOrnament = null;
    this.lastOrnamentObj = null;
    this.mobileSlider = null;
    this.ornaments = null;
    this.sizeSlider = null;
    this.tool = null;
    this.toolWrapper = null;
    this.totalOrnaments = null;
  },

  /**
   * Global bounce animation for all touchstart/mousedown
   * @param {!Element} el Element used for bounce effect
   * @param {number=} duration Time for effect
   */
  bounce: function(el, duration) {
    duration = duration || 1000;

    el.animate([
      {transform: 'scale3d(.87, .87, .87)', offset: 0},
      {transform: 'scale3d(1.1, 1.1, 1.1)', offset: .2},
      {transform: 'scale3d(.9, .9, .9)', offset: .4},
      {transform: 'scale3d(1.03, 1.03, 1.03)', offset: .6},
      {transform: 'scale3d(.97, .97, .97)', offset: .8},
      {transform: 'scale3d(1, 1, 1)', offset: 1}
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
      fill: 'forwards'
    });
  },

  extension: function() {
    return this.ie || this.ios ? '.png' : '.svg';
  }
};
