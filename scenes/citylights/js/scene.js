goog.provide('app.Scene');

goog.require('app.Constants');
goog.require('app.Dashboard');
goog.require('app.InputEvent');
goog.require('app.shared.Tutorial');



/**
 * Main class for scene
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} div DOM element containing the scene.
 * @constructor
 * @export
 */
app.Scene = function(div) {
  this.$el = $(div);
  this.$carouselEl = this.$el.find('.js-index-container');

  this.$btnPaginateNext = this.$el.find('.js-btn-paginate-next');
  this.$btnPaginatePrevious = this.$el.find('.js-btn-paginate-prev');
  this.$btnOpenSphere = this.$el.find('.js-btn-open-sphere');
  this.$btnCloseSphere = this.$el.find('.js-close-sphere');
  this.$hitAreas = this.$el.find('.js-hit-areas');
  this.$photoSphereContainer = this.$el.find('.js-photo-sphere');
  this.$sphereLocation = this.$el.find('.js-sphere-location');
  this.$sphereDescription = this.$el.find('.js-sphere-description');
  this.$sphereCTA = this.$el.find('.js-sphere-cta');

  // Prepare dynamic CTA link.
  this.ctaTemplate = this.$sphereCTA.text();

  this.dashboard_ = new app.Dashboard(this.$carouselEl);
  this.photosphere_ = new app.PhotoSphere(this.$photoSphereContainer);

  this.onCarouselLoaded_ = this.onCarouselLoaded_.bind(this);
  this.onOpenSphere_ = this.onOpenSphere_.bind(this);
  this.onCloseSphere_ = this.onCloseSphere_.bind(this);
  this.onTouchStart_ = this.onTouchStart_.bind(this);
  this.onTouchMove_ = this.onTouchMove_.bind(this);
  this.onTouchEnd_ = this.onTouchEnd_.bind(this);

  this.tutorial_ = new app.shared.Tutorial(this.$el, 'touch-citylights', 'mouse-citylights');
  this.swiping = false;

  this.init_();
};


/**
 * @private
 */
app.Scene.prototype.startTutorial_ = function() {
  // Start tutorial
  var this_ = this;
  this.tutorial_.start();
  this.$el.on('click.tutorial', function(event) {
    this_.tutorial_.off('mouse-citylights');
    this_.$el.off('click.tutorial');
  }).one('touchstart', function() {
    this_.tutorial_.off('touch-citylights');
  });
};

/**
 * @private
 */
app.Scene.prototype.showSphere_ = function() {
  this.$el.addClass('photosphere-open');
  window.santaApp.fire('sound-trigger', 'citylights_360_in');
};

/**
 * @private
 */
app.Scene.prototype.hideSphere_ = function() {
  this.$el.removeClass('photosphere-open');
  window.santaApp.fire('sound-trigger', 'citylights_360_out');
  this.photosphere_.unload();
};

/**
 * @private
 */
app.Scene.prototype.onCarouselLoaded_ = function() {
  this.$el.addClass('animate-scene-loaded');
  window.santaApp.fire('sound-trigger', 'citylights_lever');
  window.santaApp.fire('sound-trigger', 'citylights_screenup');

  this.addEventHandlers_();
};

/**
 * @private
 */
app.Scene.prototype.onOpenSphere_ = function(e) {
  if (this.swiping) {
    return;
  }

  var position = $(e.currentTarget).data('position');
  var sphere = this.dashboard_.getSphereAtPosition(position);

  this.$sphereLocation.text(sphere.location);
  this.$sphereDescription.text(sphere.description);
  this.$sphereCTA.text(this.ctaTemplate.replace('{{location}}', sphere.location));

  this.photosphere_.load(sphere.id, sphere.pov, this.showSphere_.bind(this));
};

/**
 * @private
 */
app.Scene.prototype.onCloseSphere_ = function(e) {
  this.hideSphere_();
};

/**
 * @private
 */
app.Scene.prototype.onTouchStart_ = function(e) {
  e = app.InputEvent.normalize(e);
  this.swiping = false;
  this.swipeStartX = e.pageX;

  this.$hitAreas.on(app.InputEvent.CANCEL, this.onTouchEnd_);
  this.$hitAreas.on(app.InputEvent.MOVE, this.onTouchMove_);
};

/**
 * @private
 */
app.Scene.prototype.onTouchMove_ = function(e) {
  e.preventDefault();
  e = app.InputEvent.normalize(e);
  var delta = this.swipeStartX - e.pageX;

  if (Math.abs(delta) > 50) {
    this.swiping = true;
    if (delta < 0) {
      this.dashboard_.previous();
    }
    else {
      this.dashboard_.next();
    }
    this.onTouchEnd_();
  }
};

/**
 * @private
 */
app.Scene.prototype.onTouchEnd_ = function() {
  this.$hitAreas.off(app.InputEvent.CANCEL, this.onTouchEnd_);
  this.$hitAreas.off(app.InputEvent.MOVE, this.onTouchMove_);
};

/**
 * @private
 */
app.Scene.prototype.addEventHandlers_ = function() {
  this.$hitAreas.on(app.InputEvent.START, this.onTouchStart_);
  this.$btnPaginatePrevious.on(app.InputEvent.START, this.dashboard_.previous);
  this.$btnPaginateNext.on(app.InputEvent.START, this.dashboard_.next);
  this.$btnOpenSphere.on(app.InputEvent.END, this.onOpenSphere_);
  this.$btnCloseSphere.on(app.InputEvent.START, this.onCloseSphere_);
};

/**
 * @private
 */
app.Scene.prototype.removeEventHandlers_ = function() {
  this.$hitAreas.off(app.InputEvent.START, this.onTouchStart_);
  this.$btnPaginatePrevious.off(app.InputEvent.START, this.dashboard_.previous);
  this.$btnPaginateNext.off(app.InputEvent.START, this.dashboard_.next);
  this.$btnOpenSphere.off(app.InputEvent.END, this.onOpenSphere_);
  this.$btnCloseSphere.off(app.InputEvent.START, this.onCloseSphere_);
};

/**
 * @private
 */
app.Scene.prototype.init_ = function() {
  this.dashboard_.load(this.onCarouselLoaded_);
  this.startTutorial_();
};

/**
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.removeEventHandlers_();
  this.dashboard_.destroy();
  this.dashboard_ = null;

  this.photosphere_.destroy();
  this.photosphere_ = null;
};
