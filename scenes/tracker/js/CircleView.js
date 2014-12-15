/**
 * Creates a circle wizzy.
 *
 * @param {Element} target
 * @param {string} color
 * @param {number} opacity
 * @extends {google.maps.MVCObject}
 * @constructor
 */
function CircleView(target, color, opacity) {
  this.color_ = color;
  this.opacity_ = opacity;
  this.center_ = null;

  this.el_ = document.createElement('div');
  this.el_.className = CircleView.CLASS_NAME_;

  $(this.el_).insertBefore(target);

  /**
   * @type {?number}
   * @private
   */
  this.hideTimeout_ = null;

  /**
   * @type {?number}
   * @private
   */
  this.showTimeout_ = null;

  this.hide();
  this.render_();
}

CircleView.prototype.show = function() {
  this.animateIn_();
};

CircleView.prototype.hide = function() {
  this.animateOut_();
};

CircleView.prototype.animateIn_ = function() {
  window.clearTimeout(this.hideTimeout_);

  var el = $(this.el_);

  el.css({
    borderWidth: 0
  }).show().removeClass(CircleView.CIRCLE_OUT_CLASS_NAME_).
            addClass(CircleView.CIRCLE_IN_CLASS_NAME_);

  this.showTimeout_ = window.setTimeout(function() {
    el.removeClass(CircleView.CIRCLE_IN_CLASS_NAME_);
  }, CircleView.ANIMATION_DURATION_ + 1);

  window.setTimeout(this.render_.bind(this), 1);
  window.setTimeout(this.triggerOpen_(this), CircleView.ANIMATION_DURATION_);
};

CircleView.prototype.triggerOpen_ = function() {
  google.maps.event.trigger(this, 'open');
};

CircleView.prototype.triggerClose_ = function() {
  google.maps.event.trigger(this, 'close');
};

CircleView.prototype.animateOut_ = function() {
  window.clearTimeout(this.showTimeout_);

  var el = $(this.el_);
  el.css({
    borderWidth: 0
  }).removeClass(CircleView.CIRCLE_IN_CLASS_NAME_).
     addClass(CircleView.CIRCLE_OUT_CLASS_NAME_);

  this.hideTimeout_ = window.setTimeout(function() {
    el.hide().removeClass(CircleView.CIRCLE_OUT_CLASS_NAME_);
  }, CircleView.ANIMATION_DURATION_ + 1);
};

/**
 * @return {!Element}
 */
CircleView.prototype.getEl = function() {
  return this.el_;
};

/**
 * The radius of the hole.
 *
 * @type {number}
 * @const
 */
CircleView.HOLE_RADIUS = 74;

/**
 * DOM class name.
 *
 * @type {string}
 * @private
 * @const
 */
CircleView.CLASS_NAME_ = 'circle';

/**
 * DOM class name for close button.
 *
 * @type {string}
 * @private
 */
CircleView.CIRCLE_IN_CLASS_NAME_ = 'circle-in';

/**
 * DOM class name for close button.
 *
 * @type {string}
 * @private
 * @const
 */
CircleView.CIRCLE_OUT_CLASS_NAME_ = 'circle-out';

/**
 * @type {number}
 * @private
 */
CircleView.ANIMATION_DURATION_ = 500;

/**
 * @type {string}
 * @private
 * @const
 */
CircleView.TRANSFORM_CLASS_NAME_ = 'trans';

CircleView.prototype.setCenter = function(center) {
  this.center_ = center;
  this.render_();
};

CircleView.prototype.render_ = function() {
  var center = this.center_;
  if (!center) return;

  var pageWidth = /** @type {number} */($(window).width());
  var pageHeight = /** @type {number} */($(window).height());
  var radius = Math.max(this.distTo_(0, 0),
                        this.distTo_(0, pageHeight),
                        this.distTo_(pageWidth, 0),
                        this.distTo_(pageWidth, pageHeight));

  $(this.el_).css({
    borderColor: this.color_,
    opacity: this.opacity_,
    borderWidth: radius - CircleView.HOLE_RADIUS,
    width: radius * 2,
    height: radius * 2,
    left: center.x - radius,
    top: center.y - radius
  });
};

/**
 * Cartesian distance to a given point on the screen.
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
CircleView.prototype.distTo_ = function(x, y) {
  return Math.sqrt(
      Math.pow(this.center_.x - x, 2) +
      Math.pow(this.center_.y - y, 2))
};
