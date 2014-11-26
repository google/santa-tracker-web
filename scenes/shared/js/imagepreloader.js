/* global santatracker, _ */

goog.provide('app.shared.ImagePreloader');

// We are *leaking* the ImagePreloader global for backwards compatibility.
app.shared.ImagePreloader = ImagePreloader;

/**
 * An image preloader. Loads images and updates progress.
 * Only does something useful if the images are served with expires headers.
 * @constructor
 * @param {String} moduleId The id/folder name of the module.
 * @param {Preloader} preloader The Santa Tracker preloader object.
 * @param {array} images List of images to load.
 */
function ImagePreloader(moduleId, preloader, images) {
  this.directory_ = santatracker.getStaticDir(moduleId) || '/apps/' + moduleId;

  if (!this.directory_.match(/\/$/)) {
    this.directory_ += '/';
  }

  /** @private @type {array} */
  this.images_ = images;

  /** @private @type {number} */
  this.totalCount_ = images.length;
  this.progress_ = preloader.create(this.totalCount_);

  /** @private @type {number} */
  this.currentCount_ = 0;

  this.timer_ = window.setTimeout(_.bind(this.timeout_, this), ImagePreloader.TIMEOUT * 1000);

  this.load_();
  this.maybeResolve_();
}

/** @const @type {number} */
ImagePreloader.TIMEOUT = 30; // sec

/**
 * Loads all the assets.
 * @private
 */
ImagePreloader.prototype.load_ = function() {
  var image,
      onload = this.loaded_.bind(this);
  for (var i = 0, src; src = this.images_[i]; i++) {
    image = new Image();
    image.onerror = image.onload = onload;
    image.src = this.directory_ + src;
  }
};

/**
 * Event handler for a loaded asset.
 * @private
 */
ImagePreloader.prototype.loaded_ = function() {
  this.currentCount_ += 1;
  this.progress_.notify(this.currentCount_ / this.totalCount_);
  this.maybeResolve_();
};

/**
 * Checks if we're done, if so we resolve and cleanup.
 * @private
 */
ImagePreloader.prototype.maybeResolve_ = function() {
  if (this.currentCount_ >= this.totalCount_) {
    this.progress_.resolve();
    window.clearTimeout(this.timer_);
  }
};

/**
 * Called after timeout. Prevents preloader from hanging forever.
 * @private
 */
ImagePreloader.prototype.timeout_ = function() {
  this.progress_.resolve();
};

/**
 * Stop timeout timer.
 */
ImagePreloader.prototype.dispose = function() {
  window.clearTimeout(this.timer_);
};
