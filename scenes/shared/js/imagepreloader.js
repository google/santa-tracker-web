/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/* global santatracker, _ */

goog.provide('app.shared.ImagePreloader');

// We are *leaking* the ImagePreloader global for backwards compatibility.
app.shared.ImagePreloader = ImagePreloader;

/**
 * An image preloader. Loads images and updates progress.
 * Only does something useful if the images are served with expires headers.
 * @constructor
 * @param {string} moduleId The id/folder name of the module.
 * @param {!Preloader} preloader The Santa Tracker preloader object.
 * @param {!Array.<string>} images List of images to load.
 */
function ImagePreloader(moduleId, preloader, images) {
  this.directory_ = santatracker.getStaticDir(moduleId) || '/apps/' + moduleId;

  if (!this.directory_.match(/\/$/)) {
    this.directory_ += '/';
  }

  /** @private @type {!Array.<string>} */
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
  var onload = this.loaded_.bind(this);

  this.images_.forEach(function(src) {
    var image = new Image();
    image.onerror = image.onload = onload;
    image.src = this.directory_ + src;
  }, this);
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
