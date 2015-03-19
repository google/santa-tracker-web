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

goog.provide('app.PhotoSphere');

goog.require('app.Constants');
goog.require('app.InputEvent');



/**
 * Utility class for a Google Photo Sphere
 * @param {!Element} div DOM element where to embed the sphere.
 * @constructor
 */
app.PhotoSphere = function(div) {
  this.$el = $(div);
  this.panorama = undefined;
  this.loadedId_ = undefined;
  this.panoramaLoadListener_ = undefined;
  this.panoramaPovListener_ = undefined;
  this.povTimeout = undefined;

  this.onAutoRotate_ = this.onAutoRotate_.bind(this);
  this.onPanoLoaded_ = this.onPanoLoaded_.bind(this);
  this.cancelAutoRotate_ = this.cancelAutoRotate_.bind(this);
};


app.PhotoSphere.prototype = {

  /**
   * @private
   */
  onAutoRotate_: function() {
    var pov = this.panorama.getPov();
    pov.heading += app.Constants.ROTATE_DISTANCE;
    this.panorama.setPov(pov);
    this.povTimeout = window.setTimeout(this.onAutoRotate_, app.Constants.ROTATE_INTERVAL);
  },

  /**
   * @private
   */
  cancelAutoRotate_: function() {
    window.clearTimeout(this.povTimeout);
  },

  /**
   * @private
   */
  onPanoLoaded_: function(callback) {
    callback();
    this.panorama.setVisible(true);
    this.onAutoRotate_();
  },

  /**
   * @param {string} id Photo sphere unique id to embed
   * @param {function} callback Called when Photo Sphere has been created
   */
  load: function(id, pov, callback) {
    if (id === this.loadedId_) {
      return this.onPanoLoaded_(callback);
    }

    this.destroy();

    this.panorama = new google.maps.StreetViewPanorama(
        this.$el[0],
        $.extend({}, app.Constants.PANORAMA_OPTIONS, {pov: pov}));

    this.panoramaLoadListener_ = google.maps.event.addListener(
        this.panorama,
        'pano_changed',
        function() {
          this.onPanoLoaded_(callback);
        }.bind(this));

    this.panoramaPovListener_ = google.maps.event.addListener(
        this.panorama,
        'pov_changed',
        this.cancelAutoRotate_);

    this.panorama.setPano(id);
    this.loadedId_ = id;
  },

  /**
   * Unload the loaded photo sphere
   * @public
   */
  unload: function() {
    this.cancelAutoRotate_();
  },

  /**
   * @public
   */
  destroy: function() {
    this.unload();

    if (this.panoramaLoadListener_) {
      google.maps.event.removeListener(this.panoramaLoadListener_);
    }

    if (this.panoramaPovListener_) {
      google.maps.event.removeListener(this.panoramaPovListener_);
    }

    this.panorama = undefined;
    this.loadCallback_ = undefined;
  }

};


/**
 * @public
 * @param {string} id Photo sphere unique id to get static image url for
 * @param {string} heading Heading for the image in the panorama (degrees)
 * @param {string} pitch Pitch for the image in the panorama (degrees)
 * @param {string} fov Field of view for image (degrees) OPTIONAL
 * @return {string} URL
 */
app.PhotoSphere.staticImageUrl = function(id, heading, pitch, fov) {
  var querystring = app.Constants.STATIC_QS.replace('[ID]', id);
  querystring = querystring.replace('[HEADING]', heading);
  querystring = querystring.replace('[PITCH]', pitch);
  querystring = querystring.replace('[FOV]', fov || app.Constants.PANORMA_DEFAULT_FOV);
  return app.Constants.STATIC_DOMAIN + querystring;
};