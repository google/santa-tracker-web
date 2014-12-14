goog.provide('app.PhotoSphere');

goog.require('app.Constants');
goog.require('app.InputEvent');



/**
 * Utility class for a Google Photo Sphere
 * @author david@14islands.com (David Lindkvist - 14islands.com)
 * @param {Element} div DOM element where to embed the sphere.
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
   * @public
   * @param {String} id Photo sphere unique id to embed
   * @param {Function} callback Called when Photo Sphere has been created
   * @return {null}
   */
  load: function(id, callback) {
    if (id === this.loadedId_) {
      return this.onPanoLoaded_(callback);
    }

    this.destroy();

    this.panorama = new google.maps.StreetViewPanorama(
        this.$el[0],
        app.Constants.PANORAMA_OPTIONS);

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
 * @param {String} id Photo sphere unique id to get static image url for
 * @return {String} URL
 */
app.PhotoSphere.staticImageUrl = function(id) {
  return app.Constants.STATIC_DOMAIN + app.Constants.STATIC_QS.replace('[ID]', id);
};
